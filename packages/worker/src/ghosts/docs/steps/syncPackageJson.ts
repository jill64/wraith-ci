import { Buffer } from 'node:buffer'
import { Octokit } from 'octoflare/octokit'
import { Repository } from 'octoflare/webhook'
import { PackageJson } from '../types/PackageJson.js'

const exclude_topics = ['npm', 'beta']

export const syncPackageJson = ({
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

  const { full_name, topics } = repository

  const publishConfig = packageJson.data.name?.startsWith('@')
    ? { publishConfig: { access: 'public' } }
    : {}

  const description = repository.description
    ? { description: repository.description }
    : {}

  const license = repository.license?.spdx_id
    ? { license: repository.license.spdx_id }
    : {}

  const keywords = topics.filter((x) => !exclude_topics.includes(x))

  const repoInfo = {
    ...description,
    ...license,
    bugs: `https://github.com/${full_name}/issues`,
    homepage: `https://github.com/${full_name}#readme`,
    author: 'jill64 <intents.turrets0h@icloud.com> (https://github.com/jill64)',
    repository: {
      type: 'git',
      url: `https://github.com/${full_name}.git`
    },
    ...publishConfig,
    keywords
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
