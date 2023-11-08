import exec from '@actions/exec'
import { run } from './run.js'

export const gitDiff = async () => {
  await run('git add -N .')

  const diff = await exec.exec('git diff --exit-code', undefined, {
    ignoreReturnCode: true,
    silent: true
  })

  return diff
}
