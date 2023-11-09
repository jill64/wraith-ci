import { Ghost } from '@/worker/types/Ghost.js'
import { optional, scanner, string } from 'typescanner'

const isValidJson = scanner({
  scripts: scanner({
    build: optional(string)
  })
})

export const build: Ghost = async ({ ref, installation }) => {
  const packageJson = await installation.getFile('package.json', {
    ref,
    parser: (x) => {
      const json = JSON.parse(x)
      return isValidJson(json) ? json : null
    }
  })

  if (!packageJson) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!packageJson?.data?.scripts?.build) {
    return {
      status: 'skipped',
      detail: 'Build command not found in package.json'
    }
  }

  return 'bridged'
}
