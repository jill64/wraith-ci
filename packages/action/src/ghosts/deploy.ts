import { Ghost } from '@/action/types/Ghost.js'
import { run } from '../utils/run.js'
import { findFile } from '../utils/findFile.js'

export const deploy: Ghost = async () => {
  const files = await findFile('wrangler.toml')

  if (files.length === 0) {
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
