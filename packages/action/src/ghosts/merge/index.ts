import { Ghost } from '../../../types/Ghost.js'
import { attempt } from '@jill64/attempt'
import { enableAutoMerge } from './enableAutoMerge.js'
import { isAllowUsers } from './isAllowedUsers.js'

export const merge: Ghost = async ({ payload, octokit }) => {
  const {
    owner,
    repo,
    data: { pull_number }
  } = payload

  if (!pull_number) {
    return 'skipped'
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
    ownerType: repository.owner.type,
    repo_id: repository.id
  })

  if (!allow) {
    return {
      status: 'skipped',
      detail: 'This user is not allowed to merge'
    }
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
    }
  }

  await enableAutoMerge({
    repo,
    owner,
    octokit,
    pull_number: pull_request.number
  })

  return 'success'
}
