import { attempt } from '@jill64/attempt'
import { Octokit } from 'octokit'
import { Payload } from '../../types/Payload.js'
import { enableAutoMerge } from './enableAutoMerge.js'
import { isAllowUsers } from './isAllowedUsers.js'

export const merge = async ({
  payload,
  octokit
}: {
  payload: Payload
  octokit: Octokit
}) => {
  const { owner, repo, pull_number } = payload

  if (!pull_number) {
    return 'skipped' as const
  }

  const [{ data: pull_request }, { data: repository }] = await Promise.all([
    octokit.rest.pulls.get({
      owner,
      repo,
      pull_number
    }),
    octokit.rest.repos.get({
      owner,
      repo
    })
  ])

  const allow = await isAllowUsers({
    owner,
    octokit,
    name: pull_request.user.login,
    ownerType: repository.owner.type
  })

  if (!allow) {
    return {
      status: 'skipped',
      detail: 'This user is not allowed to merge'
    } as const
  }

  const branch_protection = await attempt(
    () =>
      octokit.rest.repos.getBranchProtection({
        owner,
        repo,
        branch: pull_request.base.ref
      }),
    null
  )

  if (!branch_protection?.data.required_status_checks?.contexts.length) {
    return {
      status: 'skipped',
      detail: 'This repository does not have required status checks'
    } as const
  }

  await enableAutoMerge({
    repo,
    owner,
    octokit,
    pull_number: pull_request.number
  })

  return 'success' as const
}
