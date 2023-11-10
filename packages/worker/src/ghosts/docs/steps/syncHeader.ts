import { Repository } from 'octoflare/webhook'
import { PackageJson } from '../types/PackageJson.js'
import { replaceSection } from '../utils/replaceSection.js'

export const syncHeader = ({
  readme,
  packageJson,
  repository,
  workflowFiles
}: {
  workflowFiles: {
    name: string
    contents?: string | null
  }[]
  packageJson: PackageJson | undefined | null
  readme: string
  repository: Repository
}) => {
  const octoflareBadge = packageJson?.devDependencies?.octoflare
    ? '[![octoflare](https://img.shields.io/badge/framework-🌤️Octoflare-dodgerblue)](https://github.com/jill64/octoflare)'
    : ''

  const isGhApp = repository.topics?.includes('github-app')

  const appName = isGhApp
    ? repository.name
        .split('-')
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(' ')
    : repository.name

  const escapedRepoName = appName.replaceAll('-', '--').replaceAll(' ', '_')
  const ghAppBadge = isGhApp
    ? `[![github-app](https://img.shields.io/badge/GitHub_App-${escapedRepoName}-midnightblue)](https://github.com/apps/${repository.name})`
    : ''

  const escapedWebsiteUrl = repository.homepage
    ? encodeURIComponent(repository.homepage)
    : ''

  const repoURL = repository.homepage ? new URL(repository.homepage) : null

  const stackblitz = repoURL?.origin === 'https://stackblitz.com'

  const npmPage =
    repoURL?.origin === 'https://www.npmjs.com' ||
    repoURL?.origin === 'https://npmjs.com'

  const ghPage = repoURL?.origin === 'https://github.com'

  const siteBadge =
    !stackblitz && npmPage && ghPage && repository.homepage
      ? `[![website](https://img.shields.io/website?up_message=working&down_message=down&url=${escapedWebsiteUrl})](${repository.homepage})`
      : ''

  const workflowBadges = workflowFiles.map(
    (file) =>
      `[![${file.name}](https://github.com/${repository.full_name}/actions/workflows/${file.name}/badge.svg)](https://github.com/${repository.full_name}/actions/workflows/${file.name})`
  )

  const codecovBadge = workflowFiles.some(
    (file) => file.contents?.includes('/.github/workflows/run-vitest.yml')
  )
    ? `[![codecov-coverage](https://codecov.io/gh/${repository.full_name}/graph/badge.svg)](https://codecov.io/gh/${repository.full_name})`
    : ''

  const packageName = packageJson?.name?.trim()
  const npmLink = packageName ? `https://npmjs.com/package/${packageName}` : ''
  const versionBadge = `[![npm-version](https://img.shields.io/npm/v/${packageName})](${npmLink})`
  const licenseBadge = `[![npm-license](https://img.shields.io/npm/l/${packageName})](${npmLink})`
  const downloadBadge = `[![npm-download-month](https://img.shields.io/npm/dm/${packageName})](${npmLink})`
  const bundleSizeBadge = `[![npm-min-size](https://img.shields.io/bundlephobia/min/${packageName})](${npmLink})`
  const npmBadges =
    packageName && packageJson?.version
      ? [versionBadge, licenseBadge, downloadBadge, bundleSizeBadge]
      : []

  const libName = (
    repoURL?.pathname?.split('/')?.pop() ??
    packageName ??
    repository.name
  )
    .replaceAll('-', '--')
    .replaceAll(' ', '_')

  const stackBlitzBadge = stackblitz
    ? `[![stackblitz](https://img.shields.io/badge/StackBlitz-${libName}-dodgerblue)](${repository.homepage})`
    : ''

  const ghPages = repoURL?.origin.endsWith('github.io')
  const ghPagesBadge = ghPages
    ? `[![github-pages](https://img.shields.io/website?up_message=working&down_message=down&url=${escapedWebsiteUrl})](${repository.homepage})`
    : ''

  const badges = [
    ...npmBadges,
    ...workflowBadges,
    codecovBadge,
    siteBadge,
    ghAppBadge,
    octoflareBadge,
    stackBlitzBadge,
    ghPagesBadge
  ]
    .filter((x) => x)
    .join(' ')

  const demoSection =
    stackblitz || ghPages ? `## [Demo](${repository.homepage})` : ''

  const installSection = packageName
    ? `## Install

\`\`\`sh
npm i ${packageName}
\`\`\``
    : ''

  const content = [
    `# ${appName}`,
    badges,
    (repository.description ?? packageJson?.description ?? '').trim(),
    demoSection,
    installSection
  ]
    .filter((x) => x)
    .join('\n\n')
    .trim()

  return replaceSection({
    source: readme,
    section: 'HEADER',
    content: `\n${content}\n`
  })
}
