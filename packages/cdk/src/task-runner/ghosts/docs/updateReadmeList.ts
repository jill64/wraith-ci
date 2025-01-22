import { attempt } from '@jill64/attempt'
import { Octokit } from 'octokit'
import { findFile } from '../../utils/findFile.js'
import { gitDiff } from '../../utils/gitDiff.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { run } from '../../utils/run.js'
import { WorkflowFile } from './types/WorkflowFile.js'
import { updateReadme } from './updateReadme.js'

export const updateReadmeList = async ({
  repository,
  workflowFiles
}: {
  repository: Awaited<ReturnType<Octokit['rest']['repos']['get']>>['data']
  workflowFiles: WorkflowFile[]
}) => {
  const files = await findFile('README.md')

  const result = await Promise.all(
    files.map(
      updateReadme({
        repository,
        workflowFiles
      })
    )
  )

  if (!result.includes(true)) {
    return
  }

  await run('npm run format', repository.name)

  const diff = await attempt(() => gitDiff(repository.name))

  if (diff instanceof Error) {
    await pushCommit('chore: synchronize README.md', repository.name)
  }
}
