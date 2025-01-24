import { writeFile } from 'fs/promises'
import { array, optional, scanner, string } from 'typescanner'
import { Ghost } from '../../types/Ghost.js'
import { getPackageJson } from '../utils/getPackageJson.js'
import { pushCommit } from '../utils/pushCommit.js'

const isValidJson = scanner({
  scripts: scanner({
    lint: string
  })
})

export const lint: Ghost = async ({ run }) => {
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

  const lintResult = await run('npm run lint')

  if (lintResult.exitCode === 0) {
    return 'success'
  }

  return {
    status: 'failure',
    detail: lintResult.stderr
  }
}
