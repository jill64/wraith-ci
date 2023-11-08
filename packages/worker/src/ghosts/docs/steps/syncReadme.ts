import { Buffer } from 'node:buffer'
import { Context } from '../types/Context.js'
import { syncHeader } from './syncHeader.js'
import { syncLogo } from './syncLogo.js'

export const syncReadme = ({
  readme: originalReadme,
  workflowFiles,
  packageJson,
  repository
}: Omit<Parameters<typeof syncHeader>[0], 'readme'> & {
  readme: {
    data: string
    sha: string
  } | null
}) => {
  if (!originalReadme) {
    return null
  }

  const logoSyncedReadme = syncLogo(originalReadme.data)

  const readme = syncHeader({
    workflowFiles,
    packageJson,
    readme: logoSyncedReadme,
    repository
  })

  if (readme === originalReadme.data) {
    return null
  }

  return ({
    context: { owner, repo, octokit },
    head_branch
  }: {
    head_branch: string
    context: Context
  }) =>
    octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'chore: synchronize README.md',
      content: Buffer.from(readme).toString('base64'),
      branch: head_branch,
      sha: originalReadme.sha
    })
}
