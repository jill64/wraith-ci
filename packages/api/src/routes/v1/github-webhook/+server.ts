import {
  GITHUB_APP_PRIVATEKEY_PKCS8,
  TASK_RUNNER_URL
} from '$env/static/private'
import { encrypt } from '$lib/encrypt'
import { schema } from '$lib/schema'
import type { GhostName } from '$lib/types/GhostName'
import type { GhostStatus } from '$lib/types/GhostStatus'
import { verifyGitHubRequest } from '$lib/verifyGitHubRequeest.js'
import type { WebhookEvent } from '@octokit/webhooks-types'
import { text } from '@sveltejs/kit'
import { App } from 'octokit'
import { generateOutput } from './generateOutput'
import { isOwnerTransferred } from './isOwnerTransfered'
import { onPR } from './onPR'
import { onPRCommentEdited } from './onPRCommentEdited'
import { onPush } from './onPush'

export const POST = async ({ request }) => {
  const result = await verifyGitHubRequest(request)

  if (result instanceof Response) {
    return result
  }

  const payload = JSON.parse(result) as WebhookEvent

  const app = new App({
    appId: 420132,
    privateKey: GITHUB_APP_PRIVATEKEY_PKCS8
  })

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
    installation: app.octokit
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
      octokit: app.octokit,
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

  console.log({ triggered_ghosts, wraith_status })

  await task()

  const {
    data: { id: check_run_id }
  } = await app.octokit.rest.checks.create({
    head_sha,
    owner,
    repo,
    name: `Wraith CI${event === 'pull_request' ? ' / PR' : ''}`,
    output: generateOutput(wraith_status),
    status: 'in_progress'
  })

  await Promise.allSettled(
    triggered_ghosts.map(async (ghost) => {
      const body = await encrypt(
        JSON.stringify({
          ghost,
          pull_number,
          head_sha,
          ref,
          check_run_id
        })
      )

      const res = await fetch(TASK_RUNNER_URL, {
        method: 'POST',
        body
      })

      const res_txt = await res.text()

      console.log({
        res_txt,
        res_ok: res.ok,
        status: res.status,
        statusText: res.statusText
      })
    })
  )

  return text('Wraith CI Workflow Bridged', {
    status: 202
  })
}
