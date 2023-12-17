import { Ghost } from '@/worker/types/Ghost.js'

export const assign: Ghost = async ({ repo, owner, payload, installation }) => {
  if (!('pull_request' in payload)) {
    return 'skipped'
  }

  const { pull_request } = payload

  if (
    pull_request.user.login !== owner &&
    !pull_request.requested_reviewers.some(
      (user) => 'login' in user && user.login === owner
    )
  ) {
    await installation.kit.rest.pulls.requestReviewers({
      owner,
      repo,
      pull_number: pull_request.number,
      reviewers: [
        ...pull_request.requested_reviewers.map((user) =>
          'login' in user ? user.login : user.name
        ),
        owner
      ]
    })
  }

  return 'success'
}
