import { ActionOctokit } from 'octoflare/action'
import { db } from '../../utils/db.js'

const defaultAllowUsers = ['dependabot[bot]', 'renovate[bot]', 'wraith-ci[bot]']

export const isAllowUsers = async ({
  name,
  owner,
  octokit,
  ownerType,
  repo_id
}: {
  name: string | undefined
  owner: string
  octokit: ActionOctokit
  ownerType: string
  repo_id: number
}) => {
  if (!name) {
    throw new Error('name is undefined')
  }

  const repository = await db
    .selectFrom('repo')
    .select('ghost_merge_ignores')
    .where('github_repo_id', '=', repo_id)
    .executeTakeFirst()

  if (
    defaultAllowUsers.includes(name) &&
    !repository?.ghost_merge_ignores?.includes(name)
  ) {
    return true
  }

  if (name === owner && !repository?.ghost_merge_ignores?.includes('owner')) {
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

  return role === 'admin' && !repository?.ghost_merge_ignores?.includes('owner')
}
