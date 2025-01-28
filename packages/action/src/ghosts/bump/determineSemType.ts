import { GhostBumpConfig } from '$shared/ghost/types/GhostBumpConfig.js'

export const determineSemType = ({
  title,
  ghost_bump_config
}: {
  title: string
  ghost_bump_config: GhostBumpConfig
}) => {
  const str = title.toLocaleLowerCase()

  const majorPrefixes = ghost_bump_config?.major?.split(',') ?? [
    'major',
    'breaking'
  ]

  const minorPrefixes = ghost_bump_config?.minor?.split(',') ?? [
    'minor',
    'feat'
  ]

  const patchPrefixes = ghost_bump_config?.patch?.split(',') ?? ['*']

  if (
    patchPrefixes.some((prefix) =>
      prefix === '*' ? true : str.startsWith(prefix)
    )
  ) {
    return 'patch'
  }

  if (
    minorPrefixes.some((prefix) =>
      prefix === '*' ? true : str.startsWith(prefix)
    )
  ) {
    return 'minor'
  }

  if (
    majorPrefixes.some((prefix) =>
      prefix === '*' ? true : str.startsWith(prefix)
    )
  ) {
    return 'major'
  }

  return 'skip'
}
