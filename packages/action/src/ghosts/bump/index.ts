import { GhostBumpConfig } from '$shared/ghost/types/GhostBumpConfig.js'
import { attempt } from '@jill64/attempt'
import semver from 'semver'
import { boolean, optional, scanner, string } from 'typescanner'
import { Ghost } from '../../../types/Ghost.js'
import { db } from '../../utils/db.js'
import { getFile } from '../../utils/getFile.js'
import { getPackageJson } from '../../utils/getPackageJson.js'
import { pushCommit } from '../../utils/pushCommit.js'
import { checkCumulativeUpdate } from './checkCumulativeUpdate.js'
import { fallback } from './fallback.js'
import { formatVersionStr } from './formatVersionStr.js'
import { onMajor } from './onMajor.js'
import { onMinor } from './onMinor.js'
import { onPatch } from './onPatch.js'
import { overwriteAllVersion } from './overwriteAllVersion.js'

const isPackageJson = scanner({
  version: string,
  private: optional(boolean)
})

export const bump: Ghost = async ({ payload, octokit, run }) => {
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

  if (headJson?.private) {
    return {
      status: 'skipped',
      detail: 'Private package.json found.'
    }
  }

  const [
    { data: pull_request },
    {
      data: { default_branch, id: repo_id }
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

  const repository = await db
    .selectFrom('repo')
    .select('ghost_bump_config')
    .where('github_repo_id', '=', repo_id)
    .executeTakeFirst()

  const ghost_bump_config = attempt(
    () =>
      repository?.ghost_bump_config
        ? JSON.parse(repository.ghost_bump_config)
        : {},
    {}
  ) as GhostBumpConfig

  const fallbackType = Object.keys(ghost_bump_config).find((key) =>
    key.split(',').includes('*')
  ) as keyof GhostBumpConfig | undefined

  const sem_type =
    fallbackType === 'major'
      ? await onMajor({
          ghost_bump_config,
          pull_request_title: pull_request.title
        })
      : fallbackType === 'minor'
        ? await onMinor({
            ghost_bump_config,
            pull_request_title: pull_request.title
          })
        : fallbackType === 'patch'
          ? await onPatch({
              ghost_bump_config,
              pull_request_title: pull_request.title
            })
          : await fallback({
              ghost_bump_config,
              pull_request_title: pull_request.title
            })

  const isSkip = sem_type === 'skipped'

  const cumulativeUpdate = isSkip
    ? await checkCumulativeUpdate({
        owner,
        repo,
        default_branch,
        octokit,
        ghost_bump_config
      })
    : false

  if (isSkip && !cumulativeUpdate) {
    return {
      status: 'skipped',
      detail: 'No semantic type found.'
    }
  }

  const semType = cumulativeUpdate
    ? 'patch'
    : (sem_type as 'major' | 'minor' | 'patch')

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
    }
  }

  const base_version = formatVersionStr(baseJson?.version)
  const head_version = formatVersionStr(headJson.version)

  const newVersion = semver.inc(base_version, semType) ?? head_version

  if (semver.eq(head_version, newVersion)) {
    return 'success'
  }

  await overwriteAllVersion(newVersion)
  await run('npm run format')
  await pushCommit(`chore: bump to ${newVersion}`, run)

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
