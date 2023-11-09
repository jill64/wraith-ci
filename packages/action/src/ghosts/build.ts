import { Ghost } from '@/action/types/Ghost.js'
import { gitDiff } from '../utils/gitDiff.js'
import { pushCommit } from '../utils/pushCommit.js'
import { run } from '../utils/run.js'

export const build: Ghost = async () => {
  const result = await run('npm run build')

  if (result.exitCode !== 0) {
    return {
      status: 'failure',
      detail: result.stderr
    }
  }

  const diff = await gitDiff()

  if (diff === 0) {
    return 'success'
  }

  await pushCommit('chore: regenerate artifact')

  return {
    status: 'failure',
    detail: 'The updated artifact will be pushed shortly'
  }
}
