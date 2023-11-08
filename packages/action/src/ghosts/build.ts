import { Ghost } from '@/action/types/Ghost.js'
import { failedSummary } from '../utils/failedSummary.js'
import { gitDiff } from '../utils/gitDiff.js'
import { run } from '../utils/run.js'
import { syncChanges } from '../utils/syncChanges.js'

export const build: Ghost = async (context) => {
  const result = await run('npm run build')

  if (result.exitCode !== 0) {
    return failedSummary('Build Failed', result)
  }

  const diff = await gitDiff()

  if (diff === 0) {
    return 'success'
  }

  const syncResult = await syncChanges({
    message: 'chore: regenerate artifact',
    branch: 'wraith-ci/artifact',
    ...context
  })

  const pr = syncResult === 'pr_created'

  return {
    conclusion: pr ? 'success' : 'failure',
    output: {
      title: 'Regenerated Artifact',
      summary: pr
        ? 'A PR has been created to update the artifact.'
        : 'The updated artifact will be pushed shortly.'
    }
  }
}
