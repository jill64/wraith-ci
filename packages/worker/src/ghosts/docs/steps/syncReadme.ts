import { Buffer } from 'node:buffer'
import { Octokit } from 'octoflare/octokit'
import { insertSection } from './insertSection.js'
import { syncFooter } from './syncFooter.js'
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

  const inserted = insertSection(originalReadme.data)

  const headerSynced = syncHeader({
    workflowFiles,
    packageJson,
    readme: inserted,
    repository
  })

  const readme = syncFooter({
    readme: headerSynced,
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
