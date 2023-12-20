import { Ghost } from '@/action/types/Ghost.js'
import { scanner, string } from 'typescanner'
import { getPackageJson } from '../utils/getPackageJson.js'
import { run } from '../utils/run.js'

const isValidJson = scanner({
  scripts: scanner({
    deploy: string
  })
})

export const deploy: Ghost = async () => {
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
      detail: 'Deploy command not found in package.json'
    }
  }

  const result = await run('npm run deploy')

  if (result.exitCode === 0) {
    return 'success'
  }

  return {
    status: 'failure',
    detail: result.stderr
  }
}
