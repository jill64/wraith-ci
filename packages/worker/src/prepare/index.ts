import { isGhostName } from '@/shared/src/isGhostName.js'
import { nonNull } from '@/shared/src/nonNull.js'
import { schema } from '@/shared/src/schema.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { OctoflareInstallation } from 'octoflare'
import { Schema } from 'octoflare/webhook'
import { apps } from '../apps.js'
import { onPR } from './onPR.js'
import { onPRCommentEdited } from './onPRCommentEdited.js'
import { onPush } from './onPush.js'

export const prepare = async ({
  payload,
  installation
}: {
  payload: Schema
  installation: OctoflareInstallation<WraithPayload> | null
}) => {
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

  if (!(is_pull_request || is_push || is_pr_comment_edited)) {
    return new Response('Skip Event: No Trigger Event', {
      status: 200
    })
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

  const { ref, event, head_sha } = processed

  if (!(head_sha && Number(head_sha) !== 0)) {
    return new Response('Skip Event: No Head SHA', {
      status: 200
    })
  }

  const triggered_ghosts = Object.entries(schema)
    .filter(([, { trigger }]) =>
      event === 'push_main'
        ? trigger === 'push_main' || trigger === 'push'
        : trigger === event
    )
    .map(([name]) => (isGhostName(name) ? ([name, apps[name]] as const) : null))
    .filter(nonNull)

  return {
    ref,
    repo,
    event,
    owner,
    payload,
    head_sha,
    repository,
    installation,
    triggered_ghosts
  }
}
