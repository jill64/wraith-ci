import exec from '@actions/exec'

export const gitDiff = async () => {
  await exec.exec('git add -N .')

  const diff = await exec.exec('git diff --exit-code', undefined, {
    ignoreReturnCode: true,
    silent: true
  })

  return diff
}
