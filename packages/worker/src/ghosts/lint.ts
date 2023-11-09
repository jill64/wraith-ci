import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  scripts: scanner({
    lint: string
  })
})

export const lint: Ghost = async ({ installation, ref }) => {
  const file = await installation.getFile('package.json', {
    ref,
    parser: (x) => {
      const json = JSON.parse(x)
      return isValidJson(json) ? json : null
    }
  })

  if (!file?.data) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!file.data?.scripts.lint) {
    return {
      status: 'skipped',
      detail: 'Lint command not found in package.json'
    }
  }

  return 'bridged'
}
