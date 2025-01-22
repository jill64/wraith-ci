import { ActionOctokit } from 'octoflare/action'

const thresh = 50

export const checkCumulativeUpdate = async ({
  repo,
  owner,
  default_branch,
  octokit
}: {
  repo: string
  owner: string
  default_branch: string
  octokit: ActionOctokit
}): Promise<boolean> => {
  const [
    {
      data: { published_at }
    },
    { data: list }
  ] = await Promise.all([
    octokit.rest.repos.getLatestRelease({
      owner,
      repo
    }),
    octokit.rest.pulls.list({
      owner,
      repo,
      state: 'closed',
      base: default_branch,
      per_page: thresh
    })
  ])

  const publishedUNIX = published_at ? new Date(published_at).getTime() : 0

  if (!publishedUNIX) {
    return false
  }

  if (list.length < thresh) {
    return false
  }

  return list.every((pull) =>
    pull.merged_at ? new Date(pull.merged_at).getTime() > publishedUNIX : false
  )
}
