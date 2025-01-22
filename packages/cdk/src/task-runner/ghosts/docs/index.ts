import { Octokit } from 'octokit'
import { Payload } from '../../types/Payload.js'
import { updatePackageJsonList } from './updatePackageJsonList.js'
import { updateReadmeList } from './updateReadmeList.js'
import { listWorkflowFiles } from './utils/listWorkflowFiles.js'

export const docs = async ({
  payload: { owner, repo, ref },
  octokit
}: {
  payload: Payload
  octokit: Octokit
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
