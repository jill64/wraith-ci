import { Ghost } from '@/action/types/Ghost.js'
import { gitDiff } from '../utils/gitDiff.js'
import { pushCommit } from '../utils/pushCommit.js'
import { run } from '../utils/run.js'

export const format: Ghost = async () => {
  const formatResult = await run('npm run format')

  if (formatResult.exitCode !== 0) {
    return {
      status: 'failure',
      detail: formatResult.stderr
    }
  }

  const diff = await gitDiff()

  if (diff === 0) {
    return 'success'
  }

  await pushCommit('chore: format')

  return {
    status: 'failure',
    detail: 'Formatted code has been pushed.'
  }
}
