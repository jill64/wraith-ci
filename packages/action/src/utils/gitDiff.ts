import exec from '@actions/exec'

export const gitDiff = async () => {
  await exec.exec('git add -N .')

  const diff = await exec.exec('git diff --exit-code', undefined, {
    ignoreReturnCode: true
  })

  if (diff) {
    await exec.exec('git config user.name wraith-ci[bot]')
    await exec.exec(
      'git config user.email 41898282+wraith-ci[bot]@users.noreply.github.com'
    )
  }

  return diff
}
