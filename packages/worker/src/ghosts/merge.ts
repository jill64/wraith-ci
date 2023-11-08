import { Ghost } from '@/worker/types/Ghost.js'
import { attempt } from '@jill64/attempt'

const defaultAllowUsers = [
  'dependabot[bot]',
  'renovate[bot]',
  'ghost-docs[bot]'
]

export const merge: Ghost = async ({
  repo,
  owner,
  payload,
  installation,
  createCheckRun
}) => {
  const isAllowUsers = async ({
    name,
    ownerType
  }: {
    name: string | undefined
    ownerType: string
  }) => {
    if (!name) {
      throw new Error('name is undefined')
    }

    if (defaultAllowUsers.includes(name)) {
      return true
    }

    if (name === owner) {
      return true
    }

    if (ownerType !== 'Organization') {
      return false
    }

    const {
      data: { role }
    } = await installation.kit.rest.orgs.getMembershipForUser({
      org: owner,
      username: name
    })

    return role === 'admin'
  }

  if (!('pull_request' in payload)) {
    return
  }

  const { repository, pull_request, action } = payload

  if (
    action !== 'opened' &&
    action !== 'reopened' &&
    action !== 'synchronize'
  ) {
    return
  }

  await createCheckRun('Ghost Merge')

  const allow = await isAllowUsers({
    name: pull_request.user.login,
    ownerType: repository.owner.type
  })

  if (!allow) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'Not Allowed',
        summary: 'This user is not allowed to merge.'
      }
    }
  }

  const branch_protection = await attempt(
    () =>
      installation.kit.rest.repos
        .getBranchProtection({
          owner,
          repo,
          branch: pull_request.base.ref
        })
        .then(({ data }) => data),
    null
  )

  if (!branch_protection) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'No Branch Protection',
        summary: 'This repository does not have branch protection.'
      }
    }
  }

  if (!branch_protection.required_status_checks?.contexts.length) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'No Status Checks',
        summary: 'This repository does not have required status checks.'
      }
    }
  }

  const pull_number = pull_request.number

  const {
    repository: {
      pullRequest: { id: pullRequestId }
    }
  } = await installation.kit.graphql<{
    repository: { pullRequest: { id: string } }
  }>(/* GraphQL */ `
    query Query {
      repository(name: "${repo}", owner: "${owner}") {
        pullRequest(number: ${pull_number}) {
          id
        }
      }
    }
  `)

  try {
    await installation.kit.graphql(/* GraphQL */ `
    mutation MyMutation {
      enablePullRequestAutoMerge(input: { pullRequestId: "${pullRequestId}" }) {
        clientMutationId
      }
    }
  `)
  } catch {
    await installation.kit.rest.pulls.merge({
      repo,
      owner,
      pull_number
    })
  }

  return 'success'
}
