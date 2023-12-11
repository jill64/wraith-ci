import { Repository } from 'octoflare/webhook'
import { PackageJson } from '../types/PackageJson.js'
import { badge } from '../utils/badge.js'
import { replaceSection } from '../utils/replaceSection.js'

export const syncHeader = ({
  readme,
  packageJson,
  repository,
  workflowFiles
}: {
  workflowFiles: {
    name: string
    data?: string | null
  }[]
  packageJson: PackageJson | undefined | null
  readme: string
  repository: Repository
}) => {
  const escapedWebsiteUrl = repository.homepage
    ? encodeURIComponent(repository.homepage)
    : ''

  const repoURL = repository.homepage ? new URL(repository.homepage) : null

  const stackblitz = repoURL?.hostname === 'stackblitz.com'

  const npmPage =
    repoURL?.hostname === 'www.npmjs.com' || repoURL?.hostname === 'npmjs.com'

  const ghPage = repoURL?.origin.endsWith('github.io')

  const jillOssPage = repoURL?.origin.endsWith('jill64.dev')

  const siteBadge =
    !stackblitz && !npmPage && repository.homepage
      ? badge(repository.homepage)({
          alt: 'website',
          src: `https://img.shields.io/website?up_message=working&down_message=down&url=${escapedWebsiteUrl}`
        })
      : ''

  const workflowBadges = workflowFiles.map((file) =>
    badge(
      `https://github.com/${repository.full_name}/actions/workflows/${file.name}`
    )({
      alt: file.name,
      src: `https://github.com/${repository.full_name}/actions/workflows/${file.name}/badge.svg`
    })
  )

  // const codecovBadge = workflowFiles.some(
  //   (file) => file.data?.includes('/.github/workflows/run-vitest.yml')
  // )
  //   ? `[![codecov-coverage](https://codecov.io/gh/${repository.full_name}/graph/badge.svg)](https://codecov.io/gh/${repository.full_name})`
  //   : ''

  const packageName = packageJson?.name?.trim()
  const npmLink = packageName ? `https://npmjs.com/package/${packageName}` : ''

  const npmBadge = badge(npmLink)

  const versionBadge = npmBadge({
    alt: 'npm-version',
    src: `https://img.shields.io/npm/v/${packageName}`
  })

  const licenseBadge = npmBadge({
    alt: 'npm-license',
    src: `https://img.shields.io/npm/l/${packageName}`
  })

  const downloadBadge = npmBadge({
    alt: 'npm-download-month',
    src: `https://img.shields.io/npm/dm/${packageName}`
  })

  const bundleSizeBadge = npmBadge({
    alt: 'npm-min-size',
    src: `https://img.shields.io/bundlephobia/min/${packageName}`
  })

  const npmBadges =
    packageName && packageJson?.version
      ? [versionBadge, licenseBadge, downloadBadge, bundleSizeBadge]
      : []

  const badges =
    '<!----- BEGIN GHOST DOCS BADGES ----->' +
    [
      ...npmBadges,
      ...workflowBadges,
      // codecovBadge,
      siteBadge
    ]
      .filter((x) => x)
      .join(' ') +
    '<!----- END GHOST DOCS BADGES ----->'

  const demoSection =
    stackblitz || ghPage || jillOssPage
      ? `## [Demo](${repository.homepage})`
      : ''

  const content = [
    `# ${repository.name}`,
    badges,
    (repository.description ?? packageJson?.description ?? '').trim(),
    demoSection
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
