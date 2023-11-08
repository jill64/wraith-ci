import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { attempt } from '@jill64/attempt'
import { CloseCheckParam, octoflare } from 'octoflare'
import { apps } from './apps.js'

export default octoflare<WraithPayload>(async ({ payload, installation }) => {
  if (!installation) {
    return new Response('Skip Event: No Installation', {
      status: 200
    })
  }

  if (!('repository' in payload && payload.repository)) {
    return new Response('Skip Event: No Repository', {
      status: 200
    })
  }

  if (
    'sender' in payload &&
    payload.sender &&
    payload.sender.name === 'wraith-ci[bot]'
  ) {
    return new Response('Skip Event: Self Trigger', {
      status: 200
    })
  }

  const { repository } = payload
  const { default_branch } = repository

  const repo = repository.name
  const owner = repository.owner.login

  const ref =
    'ref' in payload
      ? payload.ref.replace('refs/heads/', '')
      : repository.default_branch

  const event = 'commits' in payload ? 'push' : 'unknown'

  const head_sha =
    'pull_request' in payload
      ? payload.pull_request.head.sha
      : 'after' in payload
      ? payload.after
      : null

  const results = Object.entries(apps).map(async ([name, app]) => {
    let check_run_id: string | null = null

    const createCheckRun = async (name: string) => {
      if (!(head_sha && Number(head_sha) !== 0)) {
        return null
      }

      const {
        data: { id }
      } = await installation.kit.rest.checks.create({
        repo,
        owner,
        name,
        head_sha,
        status: 'in_progress'
      })

      check_run_id = id.toString()

      return check_run_id
    }

    const closeCheckRun = (param: CloseCheckParam) =>
      check_run_id
        ? installation.kit.rest.checks.update({
            ...(typeof param === 'string' ? { conclusion: param } : param),
            check_run_id,
            owner,
            repo,
            status: 'completed'
          })
        : null

    const ghost_payload = await attempt(
      async () => {
        const result = await app({
          ref,
          repo,
          owner,
          event,
          head_sha,
          payload,
          repository,
          installation,
          createCheckRun
        })

        if (!result) {
          return null
        }

        if (typeof result === 'string' || 'conclusion' in result) {
          await closeCheckRun(result)
          return null
        }

        return result
      },
      async (e, o) => {
        await closeCheckRun({
          conclusion: 'failure',
          output: {
            title: 'Unhandled Worker Error',
            summary: e instanceof Error ? e.message : String(e ?? o)
          }
        })

        return null
      }
    )

    return [name, ghost_payload] as const
  })

  const data = await Promise.all(results)

  const ghosts = Object.fromEntries(
    data.filter(([, x]) => x)
  ) as WraithPayload['ghosts']

  if (!Object.keys(ghosts).length) {
    return new Response('Skip Event: No Ghosts', {
      status: 200
    })
  }

  await installation.startWorkflow({
    repo,
    owner,
    data: {
      ref,
      default_branch,
      ghosts,
      event
    }
  })

  return new Response('Wraith CI Workflow Submitted', {
    status: 202
  })
})
