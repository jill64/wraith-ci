import { Ghost } from '@/action/types/Ghost.js'
import { run } from '../utils/run.js'

export const deploy: Ghost = async () => {
  const exists = await run('test -f wrangler.toml')

  if (exists.exitCode !== 0) {
    return {
      status: 'skipped',
      detail: 'wrangler.toml not found'
    }
  }

  const result = await run('npm run deploy')

  if (result.exitCode === 0) {
    return 'success'
  }

  return {
    status: 'failure',
    detail: result.stderr
  }
}
