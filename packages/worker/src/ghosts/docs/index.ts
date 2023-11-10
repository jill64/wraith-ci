import { Ghost } from '@/worker/types/Ghost.js'
import { attempt } from '@jill64/attempt'
import { unfurl } from '@jill64/unfurl'
import { syncPackageJson } from './steps/syncPackageJson.js'
import { syncReadme } from './steps/syncReadme.js'
import { isValidPackageJson } from './utils/isValidPackageJson.js'

export const docs: Ghost = async ({
  payload,
  repository,
  installation,
  repo,
  package_json,
  owner,
  ref
}) => {
  if (ref === repository.default_branch) {
    return 'skipped'
  }

  const isTriggered =
    'commits' in payload
      ? payload.commits.some((commit) => {
          const changes = [
            ...commit.modified,
            ...commit.added,
            ...commit.removed
          ]
          return (
            changes.includes('package.json') ||
            changes.includes('README.md') ||
            changes.some((file) => file.startsWith('.github/workflows'))
          )
        })
      : true

  if (!isTriggered) {
    return 'skipped'
  }

  const { workflowFiles, readme } = await unfurl({
    workflowFiles: attempt(async (): Promise<
      {
        name: string
        data: string
      }[]
    > => {
      const { data } = await installation.kit.rest.repos.getContent({
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
    ref,
    workflowFiles,
    packageJson: packageJson?.data,
    repository,
    owner,
    repo,
    octokit: installation.kit
  })

  const uploadPackageJson = syncPackageJson({
    packageJson,
    repository,
    ref,
    octokit: installation.kit
  })

  if (!uploadReadme && !uploadPackageJson) {
    return 'skipped'
  }

  await Promise.all([uploadReadme?.(), uploadPackageJson?.()])

  return 'success'
}
