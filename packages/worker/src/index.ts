import { schema } from '@/shared/src/schema.js'
import { GhostName } from '@/shared/types/GhostName.js'
import { GhostStatus } from '@/shared/types/GhostStatus.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { octoflare } from 'octoflare'
import { generateOutput } from './generateOutput.js'
import { onPR } from './onPR.js'
import { onPRCommentEdited } from './onPRCommentEdited.js'
import { onPush } from './onPush.js'

export default octoflare<WraithPayload>(
  async ({ env, payload, installation }) => {
    if (!installation) {
      return new Response('Skip Event: No Installation', {
        status: 200
      })
    }

    const is_push = 'commits' in payload
    const is_pull_request = 'pull_request' in payload && 'number' in payload
    const is_pr_comment_edited =
      'action' in payload &&
      payload.action === 'edited' &&
      'comment' in payload &&
      'issue' in payload

    // Auto Merge
    if ('check_run' in payload && payload.action === 'completed') {
      const { check_run, repository } = payload

      const {
        owner: { login: owner },
        name: repo
      } = repository

      if (check_run.conclusion !== 'success') {
        return new Response('Skip Event: Conclusion is not success', {
          status: 200
        })
      }

      const pull_number = check_run.check_suite.pull_requests[0]?.number

      if (!pull_number) {
        return new Response('Skip Event: No Pull Request', {
          status: 200
        })
      }

      const { data: pull_request } = await installation.kit.rest.pulls.get({
        owner,
        repo,
        pull_number
      })

      if (
        !['dependabot[bot]', 'renovate[bot]', env.OCTOFLARE_APP_OWNER].includes(
          pull_request.user.login
        )
      ) {
        return new Response('Skip Event: Not Allowed User', {
          status: 200
        })
      }

      const { data: checks } = await installation.kit.rest.checks.listForRef({
        owner,
        repo,
        ref: pull_request.head.ref
      })

      if (checks.check_runs.every((check) => check.conclusion === 'success')) {
        await installation.kit.rest.pulls.merge({
          owner,
          repo,
          pull_number: pull_request.number
        })
      }
    }

    if (!(is_pull_request || is_push || is_pr_comment_edited)) {
      return new Response('Skip Event: No Trigger Event', {
        status: 200
      })
    }

    const { repository } = payload

    const repo = repository.name
    const owner = repository.owner.login

    if (repository.fork) {
      return new Response('Skip Event: Forked Repo', {
        status: 200
      })
    }

    const context = {
      repo,
      owner,
      installation
    }

    const processed = await (is_push
      ? onPush(payload)
      : is_pull_request
        ? onPR(payload, context)
        : onPRCommentEdited(payload, context))

    if (processed instanceof Response) {
      return processed
    }

    const { ref, event, head_sha, pull_number, task } = processed

    if (!(head_sha && Number(head_sha) !== 0)) {
      return new Response('Skip Event: No Head SHA', {
        status: 200
      })
    }

    const send_by_bot = payload.sender.type === 'Bot'

    const triggered_ghosts = Object.entries(schema)
      .filter(([, config]) => {
        const skip_bot = 'skip_bot' in config && config.skip_bot === true

        if (send_by_bot && skip_bot) {
          return false
        }

        const { trigger } = config

        return event === 'push_main'
          ? trigger === 'push_main' || trigger === 'push'
          : trigger === event
      })
      .map(([name]) => name as GhostName)

    const wraith_status = Object.fromEntries(
      triggered_ghosts.map((name) => [
        name,
        { status: 'processing' } as GhostStatus
      ])
    )

    const runWorkflow = async () => {
      const { dispatchWorkflow } = await installation.createCheckRun({
        head_sha,
        owner,
        repo,
        name: `Wraith CI${event === 'pull_request' ? ' / PR' : ''}`,
        output: generateOutput(wraith_status)
      })

      await dispatchWorkflow({
        triggered_ghosts,
        pull_number,
        head_sha,
        ref
      })
    }

    await Promise.allSettled([task(), runWorkflow()])

    return new Response('Wraith CI Workflow Bridged', {
      status: 202
    })
  }
)
