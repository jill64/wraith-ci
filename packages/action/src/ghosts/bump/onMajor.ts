import { GhostBumpConfig } from '$shared/ghost/types/GhostBumpConfig.js'

export const onMajor = async ({
  pull_request_title,
  ghost_bump_config
}: {
  pull_request_title: string
  ghost_bump_config: GhostBumpConfig
}): Promise<'major' | 'minor' | 'patch' | 'skipped'> => {
  const minorPrefixes = ghost_bump_config?.skip?.split(',') ?? ['feat', 'minor']
  const patchPrefixes = ghost_bump_config?.skip?.split(',') ?? ['*']
  const skipPrefixes = ghost_bump_config?.skip?.split(',') ?? ['chore']

  const semType = minorPrefixes.some((prefix) =>
    pull_request_title.startsWith(prefix)
  )
    ? 'minor'
    : patchPrefixes.some((prefix) => pull_request_title.startsWith(prefix))
      ? 'patch'
      : skipPrefixes.some((prefix) => pull_request_title.startsWith(prefix))
        ? 'skipped'
        : 'major'

  return semType
}
