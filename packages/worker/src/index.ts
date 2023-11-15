import { getGhostAlias } from '@/shared/src/getGhostAlias.js'
import { getStatusEmoji } from '@/shared/src/getStatusEmoji.js'
import { isGhostName } from '@/shared/src/isGhostName.js'
import { nonNull } from '@/shared/src/nonNull.js'
import { schema } from '@/shared/src/schema.js'
import { GhostName } from '@/shared/types/GhostName.js'
import { GhostStatus } from '@/shared/types/GhostStatus.js'
import { TriggerEvent } from '@/shared/types/TriggerEvent.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { attempt } from '@jill64/attempt'
import { unfurl } from '@jill64/unfurl'
import { ChecksOutput, Conclusion, octoflare } from 'octoflare'
import { apps } from './apps.js'

export default octoflare<WraithPayload>(async ({ payload, installation }) => {
  if (!installation) {
    return new Response('Skip Event: No Installation', {
      status: 200
    })
  }

  const is_pull_request = 'pull_request' in payload
  const is_push = 'commits' in payload

  if (!(is_pull_request || is_push)) {
    return new Response('Skip Event: No Trigger Event', {
      status: 200
    })
  }

  const head_sha = is_pull_request
    ? payload.pull_request.head.sha
    : payload.after

  if (!(head_sha && Number(head_sha) !== 0)) {
    return new Response('Skip Event: No Head SHA', {
      status: 200
    })
  }

  const { repository } = payload

  const repo = repository.name
  const owner = repository.owner.login

  const ref = is_pull_request
    ? payload.pull_request.head.ref
    : payload.ref.replace('refs/heads/', '')

  if (
    is_pull_request &&
    !(
      payload.action === 'opened' ||
      payload.action === 'reopened' ||
      payload.action === 'synchronize'
    )
  ) {
    return new Response('Skip Event: PR Opened, Reopened, or Synchronized', {
      status: 200
    })
  }

  const event = (
    is_pull_request
      ? 'pull_request'
      : ref === repository.default_branch
        ? 'push_main'
        : 'push'
  ) satisfies TriggerEvent

  const triggered_ghosts = Object.entries(schema)
    .filter(([, { trigger }]) =>
      event === 'push_main'
        ? trigger === 'push_main' || trigger === 'push'
        : trigger === event
    )
    .map(([name]) => (isGhostName(name) ? ([name, apps[name]] as const) : null))
    .filter(nonNull)

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
      name: `Wraith CI${is_pull_request ? ' / PR' : ''}`,
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
      check_run_id: check_run_id.toString(),
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
    await Promise.allSettled(
      triggered_ghosts.map(async ([name, app]) => {
        const status = await attempt(
          () =>
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
          (e, o) =>
            ({
              status: 'failure',
              detail: e?.message ?? String(o)
            }) as const
        )

        wraith_status[name] = typeof status === 'string' ? { status } : status

        await installation.kit.rest.checks.update({
          owner,
          repo,
          check_run_id: check_run_id.toString(),
          output: generateOutput(),
          status: 'in_progress'
        })
      })
    )

    const bridged_ghosts = Object.entries(wraith_status)
      .filter(([, { status }]) => status === 'bridged')
      .map(([name]) => name as GhostName)

    if (bridged_ghosts.length) {
      await installation.startWorkflow({
        repo,
        owner,
        data: {
          check_run_id,
          triggered: bridged_ghosts,
          ref
        }
      })

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
