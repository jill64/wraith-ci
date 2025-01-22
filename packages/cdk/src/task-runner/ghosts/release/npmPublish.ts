import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { array, optional, scanner, string } from 'typescanner'
import { run } from '../../utils/run.js'

const isValidJson = scanner({
  name: string,
  version: string,
  keywords: optional(array(string))
})

export const npmPublish = async (file: string, repo: string) => {
  const cwd = path.dirname(file)

  const str = await readFile(file, 'utf-8')
  const package_json = JSON.parse(str)

  if (!isValidJson(package_json)) {
    console.info(`[${file}]: No version found.`)
    return false
  }

  const version = package_json.version.trim()

  const publishedVersion = await run('npm view . version', repo, { cwd })

  if (version === publishedVersion.stdout.trim()) {
    console.info(`[${file}]: No update found.`)
    return false
  }

  await run('npm publish', repo)

  return true
}
