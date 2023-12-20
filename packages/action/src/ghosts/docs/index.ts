import { Ghost } from '@/action/types/Ghost.js'
import { updatePackageJsonList } from './updatePackageJsonList.js'
import { updateReadme } from './updateReadme.js'
import { listWorkflowFiles } from './utils/listWorkflowFiles.js'

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
    updateReadme({ repository, workflowFiles })('README.md'),
    updatePackageJsonList({ repository })
  ])

  return 'success'
}
