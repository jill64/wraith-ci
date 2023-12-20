import { ActionRepository } from '../../types/ActionRepository.js'
import { findFile } from '../../utils/findFile.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { WorkflowFile } from './types/WorkflowFile.js'
import { updateReadme } from './updateReadme.js'

export const updateReadmeList = async ({
  repository,
  workflowFiles
}: {
  repository: ActionRepository
  workflowFiles: WorkflowFile[]
}) => {
  const files = await findFile('README.md')
  const result = await Promise.all(
    files.map(updateReadme({ repository, workflowFiles }))
  )

  if (result.includes(true)) {
    await pushCommit('chore: synchronize README.md')
  }
}
