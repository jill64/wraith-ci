import { promisify } from 'node:util'
import { run } from './run.js'
import { exec } from 'node:child_process'

export const gitDiff = async () => {
  await run('git add -N .')

  const diff = await run('git diff --exit-code')

  return diff
}
