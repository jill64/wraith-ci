import { Buffer } from 'node:buffer'
import { Octokit } from 'octoflare/octokit'
import { Repository } from 'octoflare/webhook'
import { PackageJson } from '../types/PackageJson.js'

const exclude_topics = ['npm', 'beta']

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

  let repo_image = ''

  try {
    const response = await fetch(repository.html_url)
    new HTMLRewriter()
      .on('meta[property="og:image"]', {
        element(element) {
          repo_image = element.getAttribute('content') ?? ''
        }
      })
      .transform(response)
  } catch (e) {
    console.error(e)
  }

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
