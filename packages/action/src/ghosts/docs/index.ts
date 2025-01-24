import { Ghost } from '../../../types/Ghost.js'
import { updatePackageJsonList } from './updatePackageJsonList.js'
import { updateReadmeList } from './updateReadmeList.js'
import { listWorkflowFiles } from './utils/listWorkflowFiles.js'

export const docs: Ghost = async ({
  payload: {
    owner,
    repo,
    data: { ref }
  },
  octokit,
  run
}) => {
  const [{ data: repository }, workflowFiles] = await Promise.all([
    octokit.rest.repos.get({
      owner,
      repo
    }),
    listWorkflowFiles()
  ])

  if (ref === repository.default_branch) {
    return 'skipped'
  }

  await Promise.allSettled([
    updateReadmeList({ repository, workflowFiles, run }),
    updatePackageJsonList({ repository, run })
  ])

  return 'success'
}
