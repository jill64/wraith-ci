import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  scripts: scanner({
    lint: string
  })
})

export const lint: Ghost = async ({
  installation,
  ref,
  payload,
  createCheckRun
}) => {
  if (!('commits' in payload)) {
    return
  }

  const check_run_id = await createCheckRun('Ghost Lint')

  if (!check_run_id) {
    return
  }

  const file = await installation.getFile('package.json', {
    ref,
    parser: (x) => {
      const json = JSON.parse(x)
      return isValidJson(json) ? json : null
    }
  })

  if (!file) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'No package.json',
        summary: 'Not found package.json in repo.'
      }
    }
  }

  if (!file.data?.scripts.lint) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'No Lint Command',
        summary: 'Lint command not found in package.json.'
      }
    }
  }

  return {
    check_run_id
  }
}
