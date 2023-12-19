import { ActionRepository } from '../../tyeps/ActionRepository.js'
import { PackageJson } from './types/PackageJson.js'

export const syncPackageJson = async ({
  packageJson,
  repository
}: {
  repository: ActionRepository
  packageJson: PackageJson | null | undefined | null
}) => {
  if (!packageJson?.version) {
    return null
  }

  const { topics, owner } = repository

  const publishConfig = packageJson.name?.startsWith('@')
    ? { publishConfig: { access: 'public' } }
    : {}

  const license = repository.license?.spdx_id
    ? { license: repository.license.spdx_id }
    : {}

  const keywords = topics ?? []

  const html = await fetch(repository.html_url).then((res) => res.text())
  const repo_image = html.match(
    /<meta property="og:image" content="(\S*)"\s*\/>/
  )?.[1]

  if (!repo_image) {
    throw new Error('No og:image found')
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

  const oldJson = JSON.stringify(packageJson, null, 2)
  const newJson = JSON.stringify(
    {
      ...packageJson,
      ...repoInfo
    },
    null,
    2
  )

  if (oldJson === newJson) {
    return null
  }

  return newJson + '\n'
}
