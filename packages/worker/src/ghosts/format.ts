import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  scripts: scanner({
    format: string
  })
})

export const format: Ghost = async ({
  installation,
  createCheckRun,
  payload,
  ref
}) => {
  if (!('commits' in payload)) {
    return
  }

  const check_run_id = await createCheckRun('Ghost Format')

  if (!check_run_id) {
    return
  }

  const response = await installation.getFile('package.json', {
    ref,
    parser: (x) => {
      const json = JSON.parse(x)
      return isValidJson(json) ? json : null
    }
  })

  if (response === null) {
    return {
      check_run_id,
      conclusion: 'skipped',
      output: {
        title: 'No package.json',
        summary: 'Not found package.json in repo.'
      }
    }
  }

  const formatCmd = response.data?.scripts.format

  if (!formatCmd) {
    return {
      check_run_id,
      conclusion: 'skipped',
      output: {
        title: 'No Format Command',
        summary: 'Format command not found in package.json.'
      }
    }
  }

  return {
    check_run_id
  }
}
