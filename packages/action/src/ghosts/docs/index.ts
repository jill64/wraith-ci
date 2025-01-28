import { attempt } from '@jill64/attempt'
import { Ghost } from '../../../types/Ghost.js'
import { db } from '../../utils/db.js'
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

  const registered_repository = await db
    .selectFrom('repo')
    .select('ghost_docs_ignore_files')
    .where('github_repo_id', '=', repository.id)
    .executeTakeFirst()

  const ignore_files = attempt(
    () =>
      JSON.parse(
        registered_repository?.ghost_docs_ignore_files || '[]'
      ) as string[],
    [] as string[]
  )

  await Promise.allSettled([
    ignore_files.includes('README.md')
      ? []
      : updateReadmeList({ repository, workflowFiles, run }),
    ignore_files.includes('packages.json')
      ? []
      : updatePackageJsonList({ repository, run })
  ])

  return 'success'
}
