import { Ghost } from '@/action/types/Ghost.js'
import { findFile } from '../../utils/findFile.js'
import { publish } from './publish.js'

export const release: Ghost = async ({ payload: { owner, repo }, octokit }) => {
  const files = await findFile('package.json')

  if (files.length === 0) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  const monorepo = files.length > 1

  const result = files.map(
    publish({
      octokit,
      monorepo,
      owner,
      repo
    })
  )

  await Promise.allSettled(result)

  return 'success'
}
