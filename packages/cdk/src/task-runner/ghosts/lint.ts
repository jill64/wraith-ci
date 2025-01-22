import { writeFile } from 'fs/promises'
import { array, optional, scanner, string } from 'typescanner'
import { getPackageJson } from '../utils/getPackageJson.js'
import { pushCommit } from '../utils/pushCommit.js'
import { run } from '../utils/run.js'
import { Payload } from '../types/Payload.js'
import { gitClone } from '../utils/gitClone.js'
import { attempt } from '@jill64/attempt'

const isValidJson = scanner({
  scripts: scanner({
    lint: string
  })
})

export const lint = async (payload: Payload) => {
  await gitClone(payload.url, payload.ref)

  const package_json = await getPackageJson()

  if (!package_json) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!isValidJson(package_json)) {
    return {
      status: 'skipped',
      detail: 'Lint command not found in package.json'
    }
  }

  const lintResult = await attempt(() => run('npm run lint'))

  if (!(lintResult instanceof Error)) {
    return 'success'
  }

  return {
    status: 'failure',
    detail: lintResult.message
  }
}
