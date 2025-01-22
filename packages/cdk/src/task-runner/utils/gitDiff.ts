import { promisify } from 'node:util'
import { run } from './run.js'
import { exec } from 'node:child_process'

export const gitDiff = async (repo: string) => {
  await run('git add -N .', repo)

  const diff = await run('git diff --exit-code', repo)

  return diff
}
