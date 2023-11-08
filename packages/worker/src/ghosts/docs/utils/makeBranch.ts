import { Context } from '../types/Context.js'

export const makeBranch = async ({
  context: { owner, repo, octokit },
  head_branch,
  default_branch
}: {
  head_branch: string
  default_branch: string
  context: Context
}) => {
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
    ref: `refs/heads/${head_branch}`,
    sha: object.sha
  })
}
