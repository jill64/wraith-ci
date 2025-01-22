import { Octokit } from 'octokit'
import { Payload } from '../../types/Payload.js'
import { findFile } from '../../utils/findFile.js'
import { getPackageJson } from '../../utils/getPackageJson.js'
import { isValidPackageJson } from '../docs/utils/isValidPackageJson.js'
import { npmPublish } from './npmPublish.js'

export const release = async ({
  payload,
  octokit
}: {
  payload: Payload
  octokit: Octokit
}) => {
  const { owner, repo } = payload

  const files = await findFile('package.json')

  if (files.length === 0) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    } as const
  }

  const result = await Promise.allSettled(files.map((file) => npmPublish(file, repo)))

  if (!result.some((r) => r.status === 'fulfilled' && r.value)) {
    return {
      status: 'skipped',
      detail: 'No package published'
    } as const
  }

  const json = await getPackageJson()
  const rootPackageJson = isValidPackageJson(json) ? json : null
  const version = rootPackageJson?.version

  if (!version) {
    return {
      status: 'skipped',
      detail: 'Not found version in root package.json'
    } as const
  }

  await octokit.rest.repos.createRelease({
    owner,
    repo,
    tag_name: `v${version}`,
    draft: false,
    prerelease: false,
    generate_release_notes: true
  })

  return 'success' as const
}
