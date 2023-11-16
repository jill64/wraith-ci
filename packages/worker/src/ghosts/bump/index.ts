import { Ghost } from '@/worker/types/Ghost.js'
import { Buffer } from 'node:buffer'
import semver from 'semver'
import { scanner, string } from 'typescanner'
import { isValidPackageJson } from '../docs/utils/isValidPackageJson.js'
import { determineSemType } from './lib/determineSemType.js'
import { formatVersionStr } from './lib/formatVersionStr.js'

const isPackageJson = scanner({
  version: string
})

export const bump: Ghost = async ({
  repo,
  owner,
  package_json,
  repository,
  payload,
  installation
}) => {
  if (!('pull_request' in payload)) {
    return 'skipped'
  }

  const { pull_request } = payload

  if (pull_request.base.ref !== repository.default_branch) {
    return {
      status: 'skipped',
      detail:
        "This PR is not targeting the default branch, so we won't perform any version checks or bumps."
    }
  }

  if (pull_request.title.startsWith('chore')) {
    return {
      status: 'skipped',
      detail:
        "This PR was considered a trivial change, so we won't perform any version checks or bumps."
    }
  }

  const baseJson = await installation.getFile('package.json', {
    ref: pull_request.base.ref,
    parser: (str: string) => {
      const json = JSON.parse(str)
      return isPackageJson(json) ? json : null
    }
  })

  const headJsonData = package_json?.data
  const headJson =
    package_json && isValidPackageJson(headJsonData)
      ? {
          data: headJsonData,
          sha: package_json?.sha
        }
      : null

  if (!headJson?.data?.version) {
    return {
      status: 'skipped',
      detail:
        "This repository is not version controlled, so we won't perform any version checks or bumps."
    }
  }

  const base_version = formatVersionStr(baseJson?.data?.version)
  const head_version = formatVersionStr(headJson.data.version)
  
  const semType = determineSemType(pull_request.title)
  const newVersion = semver.inc(base_version, semType)

  if (semver.eq(head_version, newVersion)) {
    return 'success'
  }

  const newJsonStr = JSON.stringify(
    {
      ...headJson.data,
      version: newVersion
    },
    null,
    2
  )

  await installation.kit.rest.repos.createOrUpdateFileContents({
    repo,
    owner,
    path: 'package.json',
    message: `chore: bump to ${newVersion}`,
    content: Buffer.from(newJsonStr).toString('base64'),
    branch: pull_request.head.ref,
    sha: headJson.sha
  })

  return {
    status: 'failure',
    detail: `Auto Bump \`${head_version}\` => \`${newVersion}\``
  }
}
