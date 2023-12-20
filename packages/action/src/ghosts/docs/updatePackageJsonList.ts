import { ActionRepository } from '../../types/ActionRepository.js'
import { findFile } from '../../utils/findFile.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { updatePackageJson } from './updatePackageJson.js'

export const updatePackageJsonList = async ({
  repository
}: {
  repository: ActionRepository
}) => {
  const files = await findFile('package.json')
  const result = await Promise.all(files.map(updatePackageJson(repository)))

  if (result.includes(true)) {
    await pushCommit('chore: synchronize package.json')
  }
}
