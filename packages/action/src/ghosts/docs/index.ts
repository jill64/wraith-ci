import { Ghost } from '@/action/types/Ghost.js'
import { readFile, writeFile } from 'node:fs/promises'
import { getPackageJson } from '../../utils/getPackageJson.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { syncHeader } from './syncHeader.js'
import { syncPackageJson } from './syncPackageJson.js'
import { insertSection } from './utils/insertSection.js'
import { isValidPackageJson } from './utils/isValidPackageJson.js'
import { listWorkflowFiles } from './utils/listWorkflowFiles.js'
import { replaceSection } from './utils/replaceSection.js'

export const docs: Ghost = async ({ payload, octokit }) => {
  const {
    owner,
    repo,
    data: { ref }
  } = payload

  const { data: repository } = await octokit.rest.repos.get({
    owner,
    repo
  })

  if (ref === repository.default_branch) {
    return 'skipped'
  }

  const [workflowFiles, readme, packageJsonData] = await Promise.all([
    listWorkflowFiles(),
    readFile('README.md', 'utf-8'),
    getPackageJson()
  ])

  const packageJson = isValidPackageJson(packageJsonData)
    ? packageJsonData
    : null

  if (readme) {
    const headerSynced = syncHeader({
      workflowFiles,
      packageJson,
      readme: insertSection(readme),
      repository
    })

    const newReadme = repository.license?.spdx_id
      ? replaceSection({
          source: headerSynced,
          section: 'FOOTER',
          content: `
## License

${repository.license.spdx_id}
`
        })
      : readme

    if (readme !== newReadme) {
      await writeFile('README.md', newReadme)
      await pushCommit('chore: synchronize README.md')
    }
  }

  const newPackageJson = await syncPackageJson({
    packageJson,
    repository
  })

  if (newPackageJson) {
    await writeFile('package.json', newPackageJson)
    await pushCommit('chore: synchronize package.json')
  }

  return 'success'
}
