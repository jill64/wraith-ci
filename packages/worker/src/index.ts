import { getGhostAlias } from '@/shared/src/getGhostAlias.js'
import { getStatusEmoji } from '@/shared/src/getStatusEmoji.js'
import { GhostName } from '@/shared/types/GhostName.js'
import { GhostStatus } from '@/shared/types/GhostStatus.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { attempt } from '@jill64/attempt'
import { unfurl } from '@jill64/unfurl'
import Timeout from 'await-timeout'
import { ChecksOutput, Conclusion, octoflare } from 'octoflare'
import { prepare } from './prepare/index.js'

export default octoflare<WraithPayload>(async (context) => {
  const prepared = await prepare(context)

  if (prepared instanceof Response) {
    return prepared
  }

  const {
    ref,
    repo,
    owner,
    event,
    payload,
    head_sha,
    repository,
    installation,
    triggered_ghosts
  } = prepared

  const wraith_status = Object.fromEntries(
    triggered_ghosts.map(([name]) => [
      name,
      { status: 'processing' } as GhostStatus
    ])
  )

  const generateOutput = (): ChecksOutput => {
    const entries = Object.entries(wraith_status)

    const title = entries
      .map(
        ([name, status]) => `${getStatusEmoji(status)} ${getGhostAlias(name)}`
      )
      .join(' | ')

    const header = `
| Ghost | Status | Detail |
| ----- | ------ | ------ |
`

    const body = entries
      .map(
        ([name, status]) =>
          `| ${getGhostAlias(name)} | ${getStatusEmoji(status)} ${
            status.status
          } | ${status.detail ?? ''} |`
      )
      .join('\n')

    const summary = `${header}${body}\n`

    return {
      title,
      summary
    }
  }

  const { checks, package_json } = await unfurl({
    checks: installation.kit.rest.checks.create({
      owner,
      repo,
      name: `Wraith CI${event === 'pull_request' ? ' / PR' : ''}`,
      head_sha,
      status: 'in_progress',
      output: generateOutput()
    }),
    package_json: installation.getFile('package.json', {
      parser: JSON.parse,
      ref
    })
  })

  const check_run_id = checks.data.id

  const close = (conclusion: Conclusion, output?: ChecksOutput) =>
    installation.kit.rest.checks.update({
      owner,
      repo,
      check_run_id,
      status: 'completed',
      conclusion,
      output
    })

  if (triggered_ghosts.length === 0) {
    await close('skipped', {
      title: 'No Wraith CI Workflows Triggered',
      summary: 'No Wraith CI Workflows Triggered'
    })

    return new Response('Wraith CI Workflow Skipped', {
      status: 200
    })
  }

  try {
    const main = Promise.allSettled(
      triggered_ghosts.map(async ([name, app]) => {
        const status = await attempt(
          async () => {
            const result = await Timeout.wrap(
              app({
                ref,
                repo,
                owner,
                event,
                payload,
                head_sha,
                repository,
                installation,
                package_json
              }),
              8000,
              `Timeout main worker in \`${name}\``
            )

            return result as Awaited<ReturnType<typeof app>>
          },
          (e, o) =>
            ({
              status: 'failure',
              detail: e?.message ?? String(o)
            }) as const
        )

        wraith_status[name] = typeof status === 'string' ? { status } : status

        await Timeout.wrap(
          installation.kit.rest.checks.update({
            owner,
            repo,
            check_run_id,
            output: generateOutput(),
            status: 'in_progress'
          }),
          3000,
          `Update checks timeout in \`${name}\``
        )
      })
    )

    await Timeout.wrap(main, 5000, "Timeout main worker's Promise.allSettled")

    const bridged_ghosts = Object.entries(wraith_status)
      .filter(([, { status }]) => status === 'bridged')
      .map(([name]) => name as GhostName)

    if (bridged_ghosts.length) {
      await Timeout.wrap(
        installation.startWorkflow({
          repo,
          owner,
          data: {
            check_run_id,
            triggered: bridged_ghosts,
            ref
          }
        }),
        5000,
        'Timeout bridging workflow'
      )

      return new Response('Wraith CI Workflow Bridged', {
        status: 202
      })
    }

    const results = Object.values(wraith_status).map(({ status }) => status)

    const conclusion = results.every((status) => status === 'skipped')
      ? 'skipped'
      : results.some((status) => status === 'failure')
        ? 'failure'
        : 'success'

    await close(conclusion, generateOutput())

    return new Response(`Wraith CI Workflow Complete as ${conclusion}`, {
      status: 200
    })
  } catch (e) {
    await close('failure', {
      title: 'Unhandled Worker Error',
      summary: e instanceof Error ? e.message : String(e)
    })

    throw e
  }
})
