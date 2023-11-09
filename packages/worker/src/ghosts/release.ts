import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  version: string
})

export const release: Ghost = async ({ installation }) => {
  const response = await installation.getFile('package.json', {
    parser: (str) => {
      const json = JSON.parse(str)
      return isValidJson(json) ? json : null
    }
  })

  if (!response?.data?.version) {
    return {
      status: 'skipped',
      detail: 'No version found in package.json'
    }
  }

  return 'bridged'
}
