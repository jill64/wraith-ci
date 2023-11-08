export const determineSemType = (title: string) => {
  const str = title.toLocaleLowerCase()
  if (str.startsWith('breaking:')) {
    return 'major'
  }

  if (title.startsWith('major:')) {
    return 'major'
  }

  if (title.startsWith('minor:')) {
    return 'minor'
  }

  if (title.startsWith('feat:')) {
    return 'minor'
  }

  return 'patch'
}
