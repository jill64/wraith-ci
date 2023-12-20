import { Ghost } from '@/action/types/Ghost.js'
import semver from 'semver'
import { scanner, string } from 'typescanner'
import { getFile } from '../../utils/getFile.js'
import { getPackageJson } from '../../utils/getPackageJson.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { checkCumulativeUpdate } from './checkCumulativeUpdate.js'
import { determineSemType } from './determineSemType.js'
import { formatVersionStr } from './formatVersionStr.js'
import { overwriteAllVersion } from './overwriteAllVersion.js'

const isPackageJson = scanner({
  version: string
})

export const bump: Ghost = async ({ payload, octokit }) => {
  const {
    owner,
    repo,
    data: { pull_number }
  } = payload

  if (!pull_number) {
    return {
      status: 'skipped',
      detail: 'No pull request number found.'
    }
  }

  const headJson = await getPackageJson()

  if (!isPackageJson(headJson)) {
    return {
      status: 'skipped',
      detail: 'No package.json found.'
    }
  }

  if (!headJson?.version) {
    return {
      status: 'skipped',
      detail: 'No version found.'
    }
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
    }
  }

  const isChore = pull_request.title.startsWith('chore')

  const cumulativeUpdate = isChore
    ? await checkCumulativeUpdate({ owner, repo, default_branch, octokit })
    : false

  if (isChore && !cumulativeUpdate) {
    return {
      status: 'skipped',
      detail: 'PR is not a cumulative update.'
    }
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

  const base_version = formatVersionStr(baseJson?.version)
  const head_version = formatVersionStr(headJson.version)

  const semType = cumulativeUpdate
    ? 'patch'
    : determineSemType(pull_request.title)

  const newVersion = semver.inc(base_version, semType) ?? head_version

  if (semver.eq(head_version, newVersion)) {
    return 'success'
  }

  await overwriteAllVersion(newVersion)
  await pushCommit(`chore: bump to ${newVersion}`)

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
  }
}
