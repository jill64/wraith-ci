import exec from '@actions/exec'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import * as core from 'octoflare/action/core'
import { array, optional, scanner, string } from 'typescanner'
import { Run } from '../../utils/run.js'

const isValidJson = scanner({
  name: string,
  version: string,
  keywords: optional(array(string))
})

export const npmPublish = async (file: string, run: Run) => {
  const cwd = path.dirname(file)

  const str = await readFile(file, 'utf-8')
  const package_json = JSON.parse(str)

  if (!isValidJson(package_json)) {
    core.info(`[${file}]: No version found.`)
    return false
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
    core.info(`[${file}]: No update found.`)
    return false
  }

  await run('npm publish', {
    cwd
  })

  return true
}
