import { Octokit } from 'octokit'
import semver from 'semver'
import { boolean, optional, scanner, string } from 'typescanner'
import { Payload } from '../../types/Payload.js'
import { getFile } from '../../utils/getFile.js'
import { getPackageJson } from '../../utils/getPackageJson.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { run } from '../../utils/run.js'
import { checkCumulativeUpdate } from './checkCumulativeUpdate.js'
import { determineSemType } from './determineSemType.js'
import { formatVersionStr } from './formatVersionStr.js'
import { overwriteAllVersion } from './overwriteAllVersion.js'

const isPackageJson = scanner({
  version: string,
  private: optional(boolean)
})

export const bump = async ({
  payload,
  octokit
}: {
  payload: Payload
  octokit: Octokit
}) => {
  const { owner, repo, pull_number } = payload

  if (!pull_number) {
    return {
      status: 'skipped',
      detail: 'No pull request number found.'
    } as const
  }

  const headJson = await getPackageJson()

  if (!isPackageJson(headJson)) {
    return {
      status: 'skipped',
      detail: 'No package.json found.'
    } as const
  }

  if (!headJson?.version) {
    return {
      status: 'skipped',
      detail: 'No version found.'
    } as const
  }

  if (headJson?.private) {
    return {
      status: 'skipped',
      detail: 'Private package.json found.'
    } as const
  }

  const [
    { data: pull_request },
    {
      data: { default_branch }
    }
  ] = await Promise.all([
    octokit.rest.pulls.get({
      owner,
      repo,
      pull_number
    }),
    octokit.rest.repos.get({
      owner,
      repo
    })
  ])

  if (pull_request.base.ref !== default_branch) {
    return {
      status: 'skipped',
      detail: 'PR is not targeting default branch.'
    } as const
  }

  const isChore = pull_request.title.startsWith('chore')

  const cumulativeUpdate = isChore
    ? await checkCumulativeUpdate({ owner, repo, default_branch, octokit })
    : false

  if (isChore && !cumulativeUpdate) {
    return {
      status: 'skipped',
      detail: 'PR is not a cumulative update.'
    } as const
  }

  const baseStr = await getFile({
    repo,
    owner,
    ref: pull_request.base.ref,
    path: 'package.json',
    octokit
  })

  const baseJsonData = baseStr ? JSON.parse(baseStr) : null
  const baseJson = isPackageJson(baseJsonData) ? baseJsonData : null

  if (!baseJson?.version) {
    return {
      status: 'skipped',
      detail: 'No base version found.'
    } as const
  }

  const base_version = formatVersionStr(baseJson?.version)
  const head_version = formatVersionStr(headJson.version)

  const semType = cumulativeUpdate
    ? 'patch'
    : determineSemType(pull_request.title)

  const newVersion = semver.inc(base_version, semType) ?? head_version

  if (semver.eq(head_version, newVersion)) {
    return 'success' as const
  }

  await overwriteAllVersion(newVersion)
  await run('npm run format', repo)
  await pushCommit(`chore: bump to ${newVersion}`, repo)

  if (cumulativeUpdate) {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: pull_request.number,
      body: `This PR has automatically bumped its version to \`${newVersion}\`, because it has reached the cumulative update threshold.`
    })
  }

  return {
    status: 'failure',
    detail: `Auto Bump \`${head_version}\` => \`${newVersion}\``
  } as const
}
