import { Ghost } from '@/action/types/Ghost.js'
import { updatePackageJsonList } from './updatePackageJsonList.js'
import { updateReadme } from './updateReadme.js'
import { listWorkflowFiles } from './utils/listWorkflowFiles.js'
import { updateReadmeList } from './updateReadmeList.js'

export const docs: Ghost = async ({
  payload: {
    owner,
    repo,
    data: { ref }
  },
  octokit
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
    updateReadmeList({ repository, workflowFiles }),
    updatePackageJsonList({ repository })
  ])

  return 'success'
}
