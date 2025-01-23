import {
  OCTOFLARE_APP_ID,
  OCTOFLARE_APP_OWNER,
  OCTOFLARE_APP_REPO,
  OCTOFLARE_PRIVATE_KEY_PKCS8,
  OCTOFLARE_WEBHOOK_SECRET
} from '$env/static/private'
import { encrypt } from '$lib/encrypt'
import { schema } from '$shared/ghost/schema'
import type { GhostName } from '$shared/ghost/types/GhostName'
import type { GhostStatus } from '$shared/ghost/types/GhostStatus'
import type { WraithPayload } from '$shared/ghost/types/WraithPayload'
import { error, text } from '@sveltejs/kit'
import { octoflare, type OctoflareEnv } from 'octoflare'
import { assign } from './assign'
import { generateOutput } from './generateOutput'
import { isOwnerTransferred } from './isOwnerTransfered'
import { merge } from './merge'
import { onPR } from './onPR'
import { onPRCommentEdited } from './onPRCommentEdited'
import { onPush } from './onPush'
import { updateOutput } from './updateOutput'

export const POST = async ({ request }) => {
  const fetcher = octoflare<WraithPayload>(
    async ({ payload, installation }) => {
      if (!installation) {
        return error(500, 'Installation Not Found')
      }

      const is_push = 'commits' in payload
      const is_pull_request = 'pull_request' in payload && 'number' in payload
      const is_pr_comment_edited =
        'action' in payload &&
        payload.action === 'edited' &&
        'comment' in payload &&
        'issue' in payload

      if (!(is_pull_request || is_push || is_pr_comment_edited)) {
        return text('Skip Event: No Trigger Event')
      }

      const { repository } = payload

      const repo = repository.name
      const owner = repository.owner.login

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

      if (
        repository.fork &&
        !(await isOwnerTransferred({
          octokit: installation.kit,
          owner,
          ref,
          repo
        }))
      ) {
        return text('Skip Event: Forked Repo')
      }

      if (!(head_sha && Number(head_sha) !== 0)) {
        return text('Skip Event: No Head SHA')
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

      const { dispatchWorkflow, updateCheckRun } =
        await installation.createCheckRun({
          head_sha,
          owner,
          repo,
          name: `Wraith CI${event === 'pull_request' ? ' / PR' : ''}`,
          output: generateOutput(wraith_status)
        })

      const encrypted = await encrypt(JSON.stringify({}))

      if (triggered_ghosts.includes('merge')) {
        const result = await merge({
          payload: {
            owner,
            repo,
            pull_number
          },
          octokit: installation.kit
        })

        const conclusion = typeof result === 'string' ? result : result.status

        await updateCheckRun(
          updateOutput({
            ghost_name: 'merge',
            result: conclusion,
            output: {
              title: 'Auto Merge',
              summary: typeof result === 'string' ? '' : result.detail
            },
            job_url: undefined
          })
        )

        triggered_ghosts.splice(triggered_ghosts.indexOf('merge'), 1)
      }

      if (triggered_ghosts.includes('assign')) {
        const result = await assign({
          payload: {
            owner,
            repo,
            pull_number
          },
          octokit: installation.kit
        })

        const conclusion = typeof result === 'string' ? result : result.status

        await updateCheckRun(
          updateOutput({
            ghost_name: 'assign',
            result: conclusion,
            output: {
              title: 'Reviewer Assign',
              summary: typeof result === 'string' ? '' : result.reason
            },
            job_url: undefined
          })
        )

        triggered_ghosts.splice(triggered_ghosts.indexOf('assign'), 1)
      }

      await Promise.all([
        task(),
        dispatchWorkflow({
          triggered_ghosts,
          head_sha,
          ref,
          pull_number,
          encrypted
        })
      ])

      return text('Wraith CI Workflow Bridged', {
        status: 202
      })
    }
  )

  const res = await fetcher.fetch(request, {
    OCTOFLARE_APP_ID,
    OCTOFLARE_PRIVATE_KEY_PKCS8,
    OCTOFLARE_WEBHOOK_SECRET,
    OCTOFLARE_APP_OWNER,
    OCTOFLARE_APP_REPO
  } as Record<string, never> & OctoflareEnv)

  return res
}
