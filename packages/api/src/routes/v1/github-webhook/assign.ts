import type { Octokit } from 'octoflare/octokit'

export const assign = async ({
  payload,
  octokit
}: {
  payload: {
    repo: string
    owner: string
    pull_number: number | null
  }
  octokit: Octokit
}) => {
  const { repo, owner, pull_number } = payload

  if (!pull_number) {
    return 'skipped' as const
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
    } as const
  }

  if (
    pull_request.requested_reviewers?.some(
      (user) => 'login' in user && user.login === owner
    )
  ) {
    return {
      status: 'skipped',
      reason: 'Owner is already a reviewer'
    } as const
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

  return 'success' as const
}
