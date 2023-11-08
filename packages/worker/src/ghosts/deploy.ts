import { Ghost } from '@/worker/types/Ghost.js'

export const deploy: Ghost = async ({
  ref,
  payload,
  installation,
  createCheckRun,
  repository: { default_branch }
}) => {
  if (!('commits' in payload)) {
    return
  }

  if (ref !== default_branch) {
    return
  }

  const result = await installation.getFile('wrangler.toml')

  if (!result?.data) {
    return
  }

  const check_run_id = await createCheckRun('Ghost Deploy')

  if (!check_run_id) {
    return
  }

  return {
    check_run_id
  }
}
