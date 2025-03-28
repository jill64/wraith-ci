import type { TriggerEvent } from '$shared/ghost/types/TriggerEvent.js'
import type { PushEvent } from 'octoflare/webhook'

export const onPush = (payload: PushEvent) => {
  const { repository, after: head_sha } = payload

  const ref = payload.ref.replace('refs/heads/', '')

  const event = (
    ref === repository.default_branch
      ? ('push_main' as const)
      : ('push' as const)
  ) satisfies TriggerEvent

  return {
    ref,
    task: () => {},
    pull_number: null,
    event,
    head_sha
  }
}
