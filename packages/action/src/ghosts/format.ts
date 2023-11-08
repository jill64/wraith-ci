import { Ghost } from '@/action/types/Ghost.js'
import { failedSummary } from '../utils/failedSummary.js'
import { gitDiff } from '../utils/gitDiff.js'
import { run } from '../utils/run.js'
import { syncChanges } from '../utils/syncChanges.js'

export const format: Ghost = async ({ payload, octokit }) => {
  const formatResult = await run('npm run format')

  if (formatResult.exitCode !== 0) {
    return failedSummary('Format Failed', formatResult)
  }

  const diff = await gitDiff()

  if (diff === 0) {
    return 'success'
  }

  const pushResult = await syncChanges({
    message: 'chore: format',
    branch: 'ghost-format',
    payload,
    octokit
  })

  const pr = pushResult === 'pr_created'

  return {
    conclusion: pr ? 'success' : 'failure',
    output: {
      title: 'Auto Format Success',
      summary: pr
        ? 'Formatted code has been pushed and pull request has been created.'
        : 'Formatted code has been pushed.'
    }
  }
}
