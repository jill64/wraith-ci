import { WebhookEvent } from 'octoflare/webhook'

export const validation = (payload: WebhookEvent): boolean => {
  const isRepoEvent =
    'action' in payload &&
    'changes' in payload &&
    payload.action === 'edited' &&
    'repository' in payload &&
    payload.repository

  const isPushEvent = 'commits' in payload

  if (!isRepoEvent && !isPushEvent) {
    return false
  }

  const { repository, sender } = payload

  if (!repository) {
    return false
  }

  if (sender.login === 'wraith-ci[bot]') {
    return false
  }

  const isTriggered = isPushEvent
    ? payload.commits.some((commit) => {
        const changes = [...commit.modified, ...commit.added, ...commit.removed]
        return (
          changes.includes('package.json') ||
          changes.includes('README.md') ||
          changes.some((file) => file.startsWith('.github/workflows'))
        )
      })
    : true

  if (!isTriggered) {
    return false
  }

  return true
}
