import { Ghost } from '@/worker/types/Ghost.js'

export const derive: Ghost = async ({
  repo,
  repository,
  owner,
  installation
}) => {
  const { data: list } = await installation.kit.rest.pulls.list({
    owner,
    repo,
    state: 'open',
    base: repository.default_branch
  })

  if (!list.length) {
    return {
      status: 'skipped',
      detail: 'No open PRs targeting the default branch were found.'
    }
  }

  const result = list.map((pull) =>
    installation.kit.rest.pulls.updateBranch({
      owner,
      repo,
      pull_number: pull.number
    })
  )

  await Promise.allSettled(result)

  return {
    status: 'success',
    detail: `Updated ${result.length} PRs.`
  }
}
