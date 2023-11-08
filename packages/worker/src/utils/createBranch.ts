import { ActionOctokit } from 'octoflare/action'

export const createBranch = async ({
  owner,
  repo,
  new_branch,
  default_branch,
  octokit
}: {
  owner: string
  repo: string
  new_branch: string
  default_branch: string
  octokit: ActionOctokit
}) => {
  const exists = await octokit.rest.repos
    .getBranch({
      owner,
      repo,
      branch: new_branch
    })
    .then(() => true)
    .catch(() => false)

  if (exists) {
    return
  }

  const {
    data: { object }
  } = await octokit.rest.git.getRef({
    owner,
    repo,
    ref: `heads/${default_branch}`
  })

  await octokit.rest.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${new_branch}`,
    sha: object.sha
  })
}
