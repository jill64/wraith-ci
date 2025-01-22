import { Ghost } from '../../types/Ghost.js'

export const assign: Ghost = async ({ payload, octokit }) => {
  const {
    repo,
    owner,
    data: { pull_number }
  } = payload

  if (!pull_number) {
    return 'skipped'
  }

  const { data: pull_request } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number
  })

  if (pull_request.user.login === owner) {
    return {
      status: 'skipped',
      reason: 'Pull Request is by Owner'
    }
  }

  if (
    pull_request.requested_reviewers?.some(
      (user) => 'login' in user && user.login === owner
    )
  ) {
    return {
      status: 'skipped',
      reason: 'Owner is already a reviewer'
    }
  }

  await octokit.rest.pulls.requestReviewers({
    owner,
    repo,
    pull_number: pull_request.number,
    reviewers: [
      ...(pull_request.requested_reviewers ?? []).map((user) => user.login),
      owner
    ]
  })

  return 'success'
}
