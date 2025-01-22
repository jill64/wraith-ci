import { scanner, string } from 'typescanner'
import { getPackageJson } from '../utils/getPackageJson.js'
import { gitDiff } from '../utils/gitDiff.js'
import { pushCommit } from '../utils/pushCommit.js'
import { run } from '../utils/run.js'
import { gitClone } from '../utils/gitClone.js'
import { Payload } from '../types/Payload.js'
import { attempt } from '@jill64/attempt'

const isValidJson = scanner({
  scripts: scanner({
    format: string
  })
})

export const format = async (payload: Payload) => {
  await gitClone(payload.url, payload.ref, payload.repo)

  const package_json = await getPackageJson()

  if (!package_json) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    } as const
  }

  if (!isValidJson(package_json)) {
    return {
      status: 'skipped',
      detail: 'Format command not found in package.json'
    } as const
  }

  const formatResult = await attempt(() => run('npm run format', payload.repo))

  if (formatResult instanceof Error) {
    return {
      status: 'failure',
      detail: formatResult.message
    } as const
  }

  const diff = await attempt(() => gitDiff(payload.repo))

  if (!(diff instanceof Error)) {
    return 'success' as const
  }

  await pushCommit('chore: format', payload.repo)

  return {
    status: 'failure',
    detail: 'Formatted code has been pushed.'
  } as const
}
