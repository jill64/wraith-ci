import { Ghost } from '@/worker/types/Ghost.js'
import { attempt } from '@jill64/attempt'
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

  const [workflowFiles, packageJson, readme] = await Promise.all([
    attempt(async (): Promise<
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
    installation.getFile('package.json', {
      ref,
      parser: (x) => {
        const json = JSON.parse(x)
        return isValidPackageJson(json) ? json : null
      }
    }),
    installation.getFile('README.md', {
      ref,
      raw: true
    })
  ])

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
