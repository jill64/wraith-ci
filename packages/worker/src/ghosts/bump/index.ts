import { Ghost } from '@/worker/types/Ghost.js'
import semver from 'semver'
import { scanner, string } from 'typescanner'
import { determineSemType } from './lib/determineSemType.js'
import { formatVersionStr } from './lib/formatVersionStr.js'

const isPackageJson = scanner({
  version: string
})

export const bump: Ghost = async ({
  repo,
  owner,
  payload,
  installation,
  createCheckRun
}) => {
  if (!('pull_request' in payload)) {
    return
  }

  const { repository, pull_request, action } = payload

  if (
    action !== 'opened' &&
    action !== 'reopened' &&
    action !== 'synchronize'
  ) {
    return
  }

  const octokit = installation.kit

  await createCheckRun('Ghost Bump')

  if (pull_request.base.ref !== repository.default_branch) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'This PR is not targeting the default branch',
        summary:
          "This PR is not targeting the default branch, so we won't perform any version checks or bumps."
      }
    }
  }

  if (pull_request.title.startsWith('chore')) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'This PR was deemed a trivial change',
        summary:
          "This PR was considered a trivial change, so we won't perform any version checks or bumps."
      }
    }
  }

  const parser = (str: string) => {
    const json = JSON.parse(str)
    return isPackageJson(json) ? json : null
  }

  const [baseJson, headJson] = await Promise.all([
    installation.getFile('package.json', {
      ref: pull_request.base.ref,
      parser
    }),
    installation.getFile('package.json', {
      ref: pull_request.head.ref,
      parser
    })
  ])

  if (!headJson?.data?.version) {
    return {
      conclusion: 'skipped',
      output: {
        title: 'No Version Control',
        summary:
          "This repository is not version controlled, so we won't perform any version checks or bumps."
      }
    }
  }

  const base_version = formatVersionStr(baseJson?.data?.version)
  const head_version = formatVersionStr(headJson.data.version)

  if (semver.gt(head_version, base_version)) {
    return 'success'
  }

  const semType = determineSemType(pull_request.title)
  const newVersion = semver.inc(base_version, semType)

  const newJsonStr = JSON.stringify(
    {
      ...headJson.data,
      version: newVersion
    },
    null,
    2
  )

  await octokit.rest.repos.createOrUpdateFileContents({
    repo,
    owner,
    path: 'package.json',
    message: `chore: bump to ${newVersion}`,
    content: Buffer.from(newJsonStr).toString('base64'),
    branch: pull_request.head.ref,
    sha: headJson.sha
  })

  return {
    conclusion: 'failure',
    output: {
      title: 'Version Bump Triggered',
      summary: `
Version Integrity Check Failed.
Auto Bump Triggered.

| Ref   | Version                          |
| ----- | -------------------------------- |
| Base  | ${base_version}                  |
| Head  | ${head_version} => ${newVersion} |
`
    }
  }
}
