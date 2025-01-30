import { scanner, string } from 'typescanner'
import { Ghost } from '../../types/Ghost.js'
import { getPackageJson } from '../utils/getPackageJson.js'

const isValidJson = scanner({
  scripts: scanner({
    test: string
  })
})

export const test: Ghost = async ({ run }) => {
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
      detail: 'Test command not found in package.json'
    }
  }

  if (package_json.scripts.test.includes('playwright')) {
    await run('npx playwright install --with-deps')
  }

  const testResult = await run('npm run test')

  if (testResult.exitCode === 0) {
    return 'success'
  }

  return {
    status: 'failure',
    detail: testResult.stderr
  }
}
