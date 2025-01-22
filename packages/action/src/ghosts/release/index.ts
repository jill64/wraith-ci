import { Ghost } from '../../../types/Ghost.js'
import exec from '@actions/exec'
import { findFile } from '../../utils/findFile.js'
import { getPackageJson } from '../../utils/getPackageJson.js'
import { isValidPackageJson } from '../docs/utils/isValidPackageJson.js'
import { npmPublish } from './npmPublish.js'

export const release: Ghost = async () => {
  const files = await findFile('package.json')

  if (files.length === 0) {
    return {
      status: 'skipped',
      detail: 'Not found package.json in repo'
    }
  }

  const result = await Promise.allSettled(files.map(npmPublish))

  if (!result.some((r) => r.status === 'fulfilled' && r.value)) {
    return {
      status: 'skipped',
      detail: 'No package published'
    }
  }

  const json = await getPackageJson()
  const rootPackageJson = isValidPackageJson(json) ? json : null
  const version = rootPackageJson?.version

  if (!version) {
    return {
      status: 'skipped',
      detail: 'Not found version in root package.json'
    }
  }

  await exec.exec('gh release create', [`v${version}`, '--generate-notes'])

  return 'success'
}
