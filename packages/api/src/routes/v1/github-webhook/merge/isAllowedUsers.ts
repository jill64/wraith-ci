import type { Octokit } from 'octoflare/octokit'

const defaultAllowUsers = ['dependabot[bot]', 'renovate[bot]', 'wraith-ci[bot]']

export const isAllowUsers = async ({
  name,
  owner,
  octokit,
  ownerType
}: {
  name: string | undefined
  owner: string
  octokit: Octokit
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
  } = await octokit.rest.orgs.getMembershipForUser({
    org: owner,
    username: name
  })

  return role === 'admin'
}
