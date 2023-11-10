import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  version: string
})

export const release: Ghost = async ({ package_json }) => {
  if (!package_json) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!isValidJson(package_json.data)) {
    return {
      status: 'skipped',
      detail: 'No version found in package.json'
    }
  }

  return 'bridged'
}
