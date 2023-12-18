import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { OctoflareInstallation } from 'octoflare'
import { Repository } from 'octoflare/webhook'

const thresh = 10

export const checkCumulativeUpdate = async ({
  repo,
  owner,
  repository,
  installation
}: {
  repo: string
  owner: string
  repository: Repository
  installation: OctoflareInstallation<WraithPayload>
}): Promise<boolean> => {
  const [
    {
      data: { published_at }
    },
    { data: list }
  ] = await Promise.all([
    installation.kit.rest.repos.getLatestRelease({
      owner,
      repo
    }),
    installation.kit.rest.pulls.list({
      owner,
      repo,
      state: 'closed',
      base: repository.default_branch,
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
