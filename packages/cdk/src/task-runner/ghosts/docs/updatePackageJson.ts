import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { Octokit } from 'octokit'
import { isValidPackageJson } from './utils/isValidPackageJson.js'

type Dict = {
  [key: string]: string | Dict | undefined
}

export const updatePackageJson =
  ({
    repository,
    repoLevelConfig
  }: {
    repository: Awaited<ReturnType<Octokit['rest']['repos']['get']>>['data']
    repoLevelConfig: Dict
  }) =>
  async (packageJsonPath: string): Promise<boolean> => {
    const packageJsonStr = await readFile(packageJsonPath, 'utf-8')
    const json = JSON.parse(packageJsonStr)
    const packageJson = isValidPackageJson(json) ? json : null

    if (!packageJson?.version) {
      console.info(`[${packageJsonPath}]: No version found.`)
      return false
    }

    if (!packageJson?.name) {
      console.info(`[${packageJsonPath}]: No name found.`)
      return false
    }

    const relative = path.relative(process.cwd(), packageJsonPath)
    const relativeDir = path.dirname(relative)
    const isRepoRoot = relative === 'package.json'

    const homepage = `${repository.html_url}${
      relativeDir === '.' ? '' : relativeDir
    }#readme`

    const publishConfig = packageJson.name?.startsWith('@')
      ? { publishConfig: { access: 'public' } }
      : {}

    const description = isRepoRoot
      ? { description: repository.description }
      : {}

    const keywords = isRepoRoot ? { keywords: repository.topics ?? [] } : {}

    const repoInfo = {
      homepage,
      ...repoLevelConfig,
      ...description,
      ...publishConfig,
      ...keywords
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
      console.info(`[${packageJsonPath}]: No changes.`)
      return false
    }

    await writeFile(packageJsonPath, newJson + '\n')

    return true
  }
