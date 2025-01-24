import { scanner, string } from 'typescanner'
import { Ghost } from '../../types/Ghost.js'
import { getPackageJson } from '../utils/getPackageJson.js'
import { gitDiff } from '../utils/gitDiff.js'
import { pushCommit } from '../utils/pushCommit.js'

const isValidJson = scanner({
  scripts: scanner({
    build: string
  })
})

export const build: Ghost = async ({ run }) => {
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
      detail: 'Build command not found in package.json'
    }
  }

  const result = await run('npm run build')

  if (result.exitCode !== 0) {
    return {
      status: 'failure',
      detail: result.stderr
    }
  }

  const diff = await gitDiff(run)

  if (diff === 0) {
    return 'success'
  }

  await pushCommit('chore: regenerate artifact', run)

  return {
    status: 'failure',
    detail: 'The updated artifact will be pushed shortly'
  }
}
