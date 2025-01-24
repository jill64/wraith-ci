import { scanner, string } from 'typescanner'
import { Ghost } from '../../types/Ghost.js'
import { getPackageJson } from '../utils/getPackageJson.js'
import { gitDiff } from '../utils/gitDiff.js'
import { pushCommit } from '../utils/pushCommit.js'

const isValidJson = scanner({
  scripts: scanner({
    format: string
  })
})

export const format: Ghost = async ({ run }) => {
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
      detail: 'Format command not found in package.json'
    }
  }

  const formatResult = await run('npm run format')

  if (formatResult.exitCode !== 0) {
    return {
      status: 'failure',
      detail: formatResult.stderr
    }
  }

  const diff = await gitDiff(run)

  if (diff === 0) {
    return 'success'
  }

  await pushCommit('chore: format', run)

  return {
    status: 'failure',
    detail: 'Formatted code has been pushed.'
  }
}
