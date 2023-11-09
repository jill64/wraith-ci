import { Ghost } from '@/action/types/Ghost.js'
import { run } from '../utils/run.js'

export const deploy: Ghost = async () => {
  const result = await run('npm run deploy')

  if (result.exitCode === 0) {
    return 'success'
  }

  return {
    status: 'failure',
    detail: result.stderr
  }
}
