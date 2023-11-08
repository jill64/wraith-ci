import { Ghost } from '@/worker/types/Ghost.js'
import { optional, scanner, string } from 'typescanner'

const isValidJson = scanner({
  scripts: scanner({
    build: optional(string)
  })
})

export const build: Ghost = async ({
  ref,
  payload,
  installation,
  createCheckRun
}) => {
  if (!('commits' in payload)) {
    return
  }

  const check_run_id = await createCheckRun('Ghost Build')

  if (!check_run_id) {
    return
  }

  const packageJson = await installation.getFile('package.json', {
    ref,
    parser: (x) => {
      const json = JSON.parse(x)
      return isValidJson(json) ? json : null
    }
  })

  if (!packageJson) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'No package.json',
        summary: 'Not found package.json in repo.'
      }
    }
  }

  const buildCmd = packageJson?.data?.scripts?.build

  if (!buildCmd) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'No Build Command',
        summary: 'Build command not found in package.json.'
      }
    }
  }

  return {
    check_run_id
  }
}
