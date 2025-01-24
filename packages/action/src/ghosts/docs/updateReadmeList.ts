import { ActionRepository } from '../../types/ActionRepository.js'
import { findFile } from '../../utils/findFile.js'
import { gitDiff } from '../../utils/gitDiff.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { Run } from '../../utils/run.js'
import { WorkflowFile } from './types/WorkflowFile.js'
import { updateReadme } from './updateReadme.js'

export const updateReadmeList = async ({
  repository,
  workflowFiles,
  run
}: {
  repository: ActionRepository
  workflowFiles: WorkflowFile[]
  run: Run
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

  await run('npm run format')

  const diff = await gitDiff(run)

  if (diff) {
    await pushCommit('chore: synchronize README.md', run)
  }
}
