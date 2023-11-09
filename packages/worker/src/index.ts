import { initWraithStatus } from '@/shared/src/initWraithStatus.js'
import { isGhostName } from '@/shared/src/isGhostName.js'
import { nonNull } from '@/shared/src/nonNull.js'
import { schema } from '@/shared/src/schema.js'
import { GhostStatus } from '@/shared/types/GhostStatus.js'
import { TriggerEvent } from '@/shared/types/TriggerEvent.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { attempt } from '@jill64/attempt'
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
    !(
      is_pull_request &&
      (payload.action === 'opened' ||
        payload.action === 'reopened' ||
        payload.action === 'synchronize')
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

  const wraith_status = initWraithStatus(
    Object.fromEntries(
      triggered_ghosts.map(([name]) => [
        name,
        { status: 'processing' } satisfies GhostStatus
      ])
    )
  )

  const checks = await installation.kit.rest.checks.create({
    owner,
    repo,
    name: 'Wraith CI',
    head_sha,
    output: wraith_status.generateOutput()
  })

  const check_run_id = checks.data.id.toString()

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
    await Promise.allSettled(
      triggered_ghosts.map(async ([name, app]) => {
        const result = await attempt(
          () =>
            app({
              ref,
              repo,
              owner,
              event,
              payload,
              head_sha,
              repository,
              installation
            }),
          (e, o) =>
            ({
              status: 'failure',
              detail: e?.message ?? String(o)
            }) as const
        )

        wraith_status.update(name, result)

        const output = wraith_status.generateOutput()

        await installation.kit.rest.checks.update({
          owner,
          repo,
          check_run_id,
          output
        })
      })
    )

    const results = wraith_status.getResults()

    if (results.includes('bridged')) {
      const status = wraith_status.get()

      await installation.startWorkflow({
        repo,
        owner,
        data: {
          check_run_id,
          status,
          ref
        }
      })

      return new Response('Wraith CI Workflow Bridged', {
        status: 202
      })
    }

    const conclusion = results.every((status) => status === 'success')
      ? 'success'
      : results.every((status) => status === 'skipped')
      ? 'skipped'
      : 'failure'

    const output = wraith_status.generateOutput()

    await close(conclusion, output)

    return new Response('Wraith CI Workflow Complete', {
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
