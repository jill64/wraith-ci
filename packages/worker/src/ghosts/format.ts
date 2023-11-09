import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  scripts: scanner({
    format: string
  })
})

export const format: Ghost = async ({ installation, ref }) => {
  const response = await installation.getFile('package.json', {
    ref,
    parser: (x) => {
      const json = JSON.parse(x)
      return isValidJson(json) ? json : null
    }
  })

  if (!response?.data) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!response.data?.scripts.format) {
    return {
      status: 'skipped',
      detail: 'Format command not found in package.json'
    }
  }

  return 'bridged'
}
