import semver from 'semver'

export const formatVersionStr = (str: string | undefined | null) => {
  const trimmed = str?.trim()
  const ver = trimmed && trimmed !== 'null' ? semver.clean(trimmed) : null
  return ver ?? '0.0.0'
}
