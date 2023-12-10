import { Buffer } from 'node:buffer'
import { Octokit } from 'octoflare/octokit'
import { Repository } from 'octoflare/webhook'
import * as cf from 'octoflare/workers'
import { PackageJson } from '../types/PackageJson.js'

const exclude_topics = ['npm', 'beta']
const rewriter = new cf.HTMLRewriter()

export const syncPackageJson = async ({
  packageJson,
  repository,
  ref,
  octokit
}: {
  repository: Repository
  packageJson:
    | {
        data: PackageJson | null
        sha: string | undefined
      }
    | undefined
    | null
  ref: string
  octokit: Octokit
}) => {
  if (!packageJson?.data?.version) {
    return null
  }

  const { topics, owner } = repository

  const publishConfig = packageJson.data.name?.startsWith('@')
    ? { publishConfig: { access: 'public' } }
    : {}

  const license = repository.license?.spdx_id
    ? { license: repository.license.spdx_id }
    : {}

  const keywords = topics.filter((x) => !exclude_topics.includes(x))

  const response = await cf.fetch(repository.html_url)

  let repo_image = ''

  rewriter
    .on('meta[property="og:image"]', {
      element(element) {
        repo_image = element.getAttribute('content') ?? ''
      }
    })
    .transform(response)

  const repoInfo = {
    description: repository.description ?? '',
    ...license,
    bugs: `${repository.html_url}/issues`,
    homepage: `${repository.html_url}#readme`,
    author: {
      name: owner.name,
      email: owner.email,
      url: owner.html_url,
      image: owner.avatar_url
    },
    repository: {
      type: 'git',
      url: repository.clone_url,
      image: repo_image
    },
    ...publishConfig,
    keywords,
    prettier: '@jill64/prettier-config'
  }

  const oldJson = JSON.stringify(packageJson.data, null, 2)
  const newJson = JSON.stringify(
    {
      ...packageJson.data,
      ...repoInfo
    },
    null,
    2
  )

  if (oldJson === newJson) {
    return null
  }

  return () =>
    octokit.rest.repos.createOrUpdateFileContents({
      owner: repository.owner.login,
      repo: repository.name,
      path: 'package.json',
      message: 'chore: synchronize package.json',
      content: Buffer.from(newJson + '\n').toString('base64'),
      branch: ref,
      sha: packageJson.sha
    })
}
