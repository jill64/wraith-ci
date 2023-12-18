import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { OctoflareInstallation } from 'octoflare'
import { Repository } from 'octoflare/webhook'

const thres = 10

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
  const { data } = await installation.kit.rest.pulls.list({
    owner,
    repo,
    state: 'closed',
    base: repository.default_branch,
    per_page: thres
  })

  return (
    data.length === thres &&
    data.every((pull) => pull.merged_at) &&
    data.every((pull) => pull.title.startsWith('chore'))
  )
}
