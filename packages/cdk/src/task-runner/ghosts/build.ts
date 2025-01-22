import { scanner, string } from 'typescanner'
import { getPackageJson } from '../utils/getPackageJson.js'
import { gitDiff } from '../utils/gitDiff.js'
import { pushCommit } from '../utils/pushCommit.js'
import { run } from '../utils/run.js'
import { Payload } from '../types/Payload.js'
import { Octokit } from 'octokit'
import { gitClone } from '../utils/gitClone.js'
import { attempt } from '@jill64/attempt'

const isValidJson = scanner({
  scripts: scanner({
    build: string
  })
})

export const build = async (payload: Payload, octokit: Octokit) => {
  await gitClone(payload.url, payload.ref)

  const package_json = await getPackageJson()

  if (!package_json) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  if (!isValidJson(package_json)) {
    return {
      status: 'skipped',
      detail: 'Build command not found in package.json'
    }
  }

  const result = await attempt(() => run('npm run build'))

  if (result instanceof Error) {
    return {
      status: 'failure',
      detail: result.message
    }
  }

  const diff = await attempt(gitDiff)

  if (!(diff instanceof Error)) {
    return 'success'
  }

  await pushCommit('chore: regenerate artifact')

  return {
    status: 'failure',
    detail: 'The updated artifact will be pushed shortly'
  }
}
