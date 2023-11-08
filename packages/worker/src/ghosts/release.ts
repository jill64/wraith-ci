import { Ghost } from '@/worker/types/Ghost.js'
import { scanner, string } from 'typescanner'

const isValidJson = scanner({
  version: string
})

export const release: Ghost = async ({
  payload,
  ref,
  repository,
  installation,
  createCheckRun
}) => {
  if (!('commits' in payload)) {
    return
  }

  if (ref !== repository.default_branch) {
    return
  }

  const response = await installation.getFile('package.json', {
    parser: (str) => {
      const json = JSON.parse(str)
      return isValidJson(json) ? json : null
    }
  })

  if (!response?.data?.version) {
    return
  }

  const check_run_id = await createCheckRun('Ghost Release')

  if (!check_run_id) {
    return
  }

  return {
    check_run_id
  }
}
