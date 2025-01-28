import { GhostBumpConfig } from '$shared/ghost/types/GhostBumpConfig.js'

export const fallback = async ({
  ghost_bump_config,
  pull_request_title
}: {
  ghost_bump_config: GhostBumpConfig
  pull_request_title: string
}): Promise<'major' | 'minor' | 'patch' | 'skipped'> => {
  const majorPrefixes = ghost_bump_config?.major?.split(',') ?? [
    'major',
    'breaking'
  ]
  const minorPrefixes = ghost_bump_config?.minor?.split(',') ?? [
    'minor',
    'feat'
  ]
  const patchPrefixes = ghost_bump_config?.patch?.split(',') ?? ['*']
  const skipPrefixes = ghost_bump_config?.skip?.split(',') ?? ['chore']

  const semType = majorPrefixes.some((prefix) =>
    pull_request_title.startsWith(prefix)
  )
    ? 'major'
    : minorPrefixes.some((prefix) => pull_request_title.startsWith(prefix))
      ? 'minor'
      : patchPrefixes.some((prefix) => pull_request_title.startsWith(prefix))
        ? 'patch'
        : skipPrefixes.some((prefix) => pull_request_title.startsWith(prefix))
          ? 'skipped'
          : 'patch'

  return semType
}
