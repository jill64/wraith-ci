import { Ghost } from '@/worker/types/Ghost.js'
import { attempt } from '@jill64/attempt'
import { enableAutoMerge } from './lib/enableAutoMerge.js'
import { isAllowUsers } from './lib/isAllowedUsers.js'

export const merge: Ghost = async ({
  repo,
  owner,
  repository,
  payload,
  installation
}) => {
  if (!('pull_request' in payload)) {
    return 'skipped'
  }

  const { pull_request } = payload

  const allow = await isAllowUsers({
    owner,
    octokit: installation.kit,
    name: pull_request.user.login,
    ownerType: repository.owner.type
  })

  if (!allow) {
    return {
      status: 'skipped',
      detail: 'This user is not allowed to merge'
    }
  }

  const branch_protection = await attempt(
    () =>
      installation.kit.rest.repos.getBranchProtection({
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
    octokit: installation.kit,
    pull_number: pull_request.number
  })

  return 'success'
}
