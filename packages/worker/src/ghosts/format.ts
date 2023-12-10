import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  scripts: scanner({
    format: string
  })
})

export const format: Ghost = async ({ payload, package_json }) => {
  if (!package_json) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if ('sender' in payload && payload.sender?.type === 'Bot') {
    return {
      status: 'skipped',
      detail: 'Commit from Bot'
    }
  }

  if (!isValidJson(package_json.data)) {
    return {
      status: 'skipped',
      detail: 'Format command not found in package.json'
    }
  }

  return 'bridged'
}
