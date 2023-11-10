import { Ghost } from '@/worker/types/Ghost.js'
import { attempt } from '@jill64/attempt'
import { unfurl } from '@jill64/unfurl'
import { syncPackageJson } from './steps/syncPackageJson.js'
import { syncReadme } from './steps/syncReadme.js'
import { validation } from './steps/validation.js'
import { Context } from './types/Context.js'
import { isValidPackageJson } from './utils/isValidPackageJson.js'
import { makeBranch } from './utils/makeBranch.js'

export const docs: Ghost = async ({
  payload,
  repository,
  installation,
  repo,
  package_json,
  event,
  owner,
  ref
}) => {
  const result = validation(payload)

  if (!result) {
    return 'skipped'
  }

  const octokit = installation.kit

  const context = {
    owner,
    repo,
    octokit
  } satisfies Context

  const { workflowFiles, readme } = await unfurl({
    workflowFiles: attempt(async (): Promise<
      {
        name: string
        data: string
      }[]
    > => {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '.github/workflows',
        ref
      })

      if (!Array.isArray(data)) {
        return []
      }

      const result = data.map(({ path }) =>
        installation.getFile(path, {
          ref
        })
      )

      const list = await Promise.all(result)

      return list.filter((x): x is NonNullable<(typeof list)[number]> => !!x)
    }, []),
    readme: installation.getFile('README.md', {
      ref,
      raw: true
    })
  })

  const packageJsonData = package_json?.data
  const packageJson =
    package_json && isValidPackageJson(packageJsonData)
      ? {
          data: packageJsonData,
          sha: package_json.sha
        }
      : null

  const uploadReadme = syncReadme({
    readme,
    workflowFiles,
    packageJson: packageJson?.data,
    repository
  })

  const uploadPackageJson = syncPackageJson({
    packageJson,
    repository
  })

  if (!uploadReadme && !uploadPackageJson) {
    return 'skipped'
  }

  const isPushEvent = event === 'push'
  const nowDefaultBranch = ref === repository.default_branch
  const head_branch = nowDefaultBranch ? 'ghost-docs/synchronize' : ref
  const makeNewBranch =
    (nowDefaultBranch || !isPushEvent) &&
    (await octokit.rest.repos
      .getBranch({
        owner,
        repo,
        branch: head_branch
      })
      .then(() => false)
      .catch(() => true))

  if (makeNewBranch) {
    await makeBranch({
      default_branch: repository.default_branch,
      head_branch,
      context
    })
  }

  await Promise.all([
    uploadReadme?.({
      context,
      head_branch
    }),
    uploadPackageJson?.({
      octokit,
      head_branch
    })
  ])

  if (!makeNewBranch) {
    return 'success'
  }

  await octokit.rest.pulls.create({
    owner,
    repo,
    title: 'chore: Ghost Docs Synchronization',
    head: head_branch,
    base: repository.default_branch
  })

  return 'success'
}
