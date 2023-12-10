import { Buffer } from 'node:buffer'
import { Octokit } from 'octoflare/octokit'
import { syncHeader } from './syncHeader.js'

export const syncReadme = ({
  readme: originalReadme,
  workflowFiles,
  packageJson,
  repository,
  ref,
  owner,
  repo,
  octokit
}: Omit<Parameters<typeof syncHeader>[0], 'readme'> & {
  readme: {
    data: string
    sha: string
  } | null
  ref: string
  owner: string
  repo: string
  octokit: Octokit
}) => {
  if (!originalReadme) {
    return null
  }

  const readme = syncHeader({
    workflowFiles,
    packageJson,
    readme: originalReadme.data,
    repository
  })

  if (readme === originalReadme.data) {
    return null
  }

  return () =>
    octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'chore: synchronize README.md',
      content: Buffer.from(readme).toString('base64'),
      branch: ref,
      sha: originalReadme.sha
    })
}
