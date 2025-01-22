import { Payload } from '../types/Payload.js'
import { App, Octokit } from 'octokit'

export const assign = async (payload: Payload, octokit: Octokit) => {
  const { pull_number, owner, repo } = payload

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
