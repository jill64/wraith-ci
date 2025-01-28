import { GhostBumpConfig } from '$shared/ghost/types/GhostBumpConfig.js'

export const onMinor = async ({
  pull_request_title,
  ghost_bump_config
}: {
  pull_request_title: string
  ghost_bump_config: GhostBumpConfig
}): Promise<'major' | 'minor' | 'patch' | 'skipped'> => {
  const majorPrefixes = ghost_bump_config?.major?.split(',') ?? [
    'major',
    'breaking'
  ]
  const patchPrefixes = ghost_bump_config?.patch?.split(',') ?? ['*']
  const skipPrefixes = ghost_bump_config?.skip?.split(',') ?? ['chore']

  const semType = majorPrefixes.some((prefix) =>
    pull_request_title.startsWith(prefix)
  )
    ? 'major'
    : patchPrefixes.some((prefix) => pull_request_title.startsWith(prefix))
      ? 'patch'
      : skipPrefixes.some((prefix) => pull_request_title.startsWith(prefix))
        ? 'skipped'
        : 'minor'

  return semType
}
