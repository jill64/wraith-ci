import { readFile, writeFile } from 'node:fs/promises'
import { ActionRepository } from '../../types/ActionRepository.js'
import { isValidPackageJson } from './utils/isValidPackageJson.js'

export const updatePackageJson =
  (repository: ActionRepository) =>
  async (packageJsonPath: string): Promise<boolean> => {
    const packageJsonStr = await readFile(packageJsonPath, 'utf-8')
    const json = JSON.parse(packageJsonStr)
    const packageJson = isValidPackageJson(json) ? json : null

    if (!packageJson?.version) {
      console.log(`[${packageJsonPath}]: No version found.`)
      return false
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
    const repo_image =
      html.match(/<meta property="og:image" content="(\S*)"\s*\/>/)?.[1] ?? ''

    const repoInfo = {
      description: repository.description ?? '',
      ...license,
      bugs: `${repository.html_url}/issues`,
      homepage: `${repository.html_url}#readme`,
      author: {
        name: owner.login,
        email: 'intents.turrets0h@icloud.com',
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
      console.log(`[${packageJsonPath}]: No changes.`)
      return false
    }

    await writeFile(packageJsonPath, newJson + '\n')

    return true
  }
