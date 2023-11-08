import { Ghost } from '@/action/types/Ghost.js'
import { failedSummary } from '../utils/failedSummary.js'
import { run } from '../utils/run.js'

export const deploy: Ghost = async () => {
  const result = await run('npm run deploy')

  if (result.exitCode === 0) {
    return 'success'
  }

  return failedSummary('Deploy Failed', result)
}
