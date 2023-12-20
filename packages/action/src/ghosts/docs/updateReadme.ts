import { attempt } from '@jill64/attempt'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { ActionRepository } from '../../types/ActionRepository.js'
import { WorkflowFile } from './types/WorkflowFile.js'
import { insertSection } from './utils/insertSection.js'
import { isValidPackageJson } from './utils/isValidPackageJson.js'
import { replaceSection } from './utils/replaceSection.js'
import { syncHeader } from './utils/syncHeader.js'

export const updateReadme =
  ({
    repository,
    workflowFiles
  }: {
    repository: ActionRepository
    workflowFiles: WorkflowFile[]
  }) =>
  async (readmePath: string): Promise<boolean> => {
    const readme = await readFile(readmePath, 'utf-8')

    if (!readme) {
      console.log(`[${readmePath}]: No readme found.`)
      return false
    }

    const dir = path.dirname(readmePath)
    const packageJsonPath = path.join(dir, 'package.json')
    const packageJsonStr = await readFile(packageJsonPath, 'utf-8')
    const json = attempt(() => JSON.parse(packageJsonStr), null)
    const packageJson = isValidPackageJson(json) ? json : null

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

    if (readme === newReadme) {
      console.log(`[${readmePath}]: No update found.`)
      return false
    }

    await writeFile(readmePath, newReadme)

    return true
  }
