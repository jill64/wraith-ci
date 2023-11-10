import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  scripts: scanner({
    lint: string
  })
})

export const lint: Ghost = async ({ package_json }) => {
  if (!package_json) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!isValidJson(package_json.data)) {
    return {
      status: 'skipped',
      detail: 'Lint command not found in package.json'
    }
  }

  return 'bridged'
}
