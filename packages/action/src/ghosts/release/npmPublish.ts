import exec from '@actions/exec'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { array, optional, scanner, string } from 'typescanner'

const isValidJson = scanner({
  name: string,
  version: string,
  keywords: optional(array(string))
})

export const npmPublish = async (file: string) => {
  const cwd = path.dirname(file)

  const str = await readFile(file, 'utf-8')
  const package_json = JSON.parse(str)

  if (!isValidJson(package_json)) {
    console.log(`[${file}]: No version found.`)
    return
  }

  const version = package_json.version.trim()

  const publishedVersion = await exec.getExecOutput(
    'npm view . version',
    undefined,
    {
      cwd,
      ignoreReturnCode: true
    }
  )

  if (version === publishedVersion.stdout.trim()) {
    console.log(`[${file}]: No update found.`)
    return
  }

  await exec.exec('npm publish', undefined, {
    cwd
  })
}
