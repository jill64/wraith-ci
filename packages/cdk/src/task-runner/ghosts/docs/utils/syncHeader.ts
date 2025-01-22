import { ActionRepository } from '../../../types/ActionRepository.js'
import { PackageJson } from '../types/PackageJson.js'
import { WorkflowFile } from '../types/WorkflowFile.js'
import { badge } from './badge.js'
import { replaceSection } from './replaceSection.js'
import { tagBegin, tagEnd } from './snippets.js'

export const syncHeader = ({
  readme,
  packageJson,
  repository,
  workflowFiles
}: {
  workflowFiles: WorkflowFile[]
  packageJson: PackageJson | undefined | null
  readme: string
  repository: ActionRepository
}) => {
  const escapedWebsiteUrl = repository.homepage
    ? encodeURIComponent(repository.homepage)
    : ''

  const repoURL = repository.homepage ? new URL(repository.homepage) : null
  const jillOssPage = repoURL?.origin.endsWith('jill64.dev')

  const siteBadge =
    jillOssPage && repository.homepage
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

  const badges = `
${tagBegin('BADGES')}
${[
  ...npmBadges,
  ...workflowBadges,
  // codecovBadge,
  siteBadge
]
  .filter((x) => x)
  .join(' ')}
${tagEnd('BADGES')}
`

  const demoSection = jillOssPage ? `## [Demo](${repository.homepage})` : ''

  const content = [
    `# ${packageName ?? repository.name}`,
    badges,
    (packageJson?.description ?? repository.description ?? '').trim(),
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
