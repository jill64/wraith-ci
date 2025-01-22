import { promisify } from 'node:util'
import { run } from './run.js'
import { exec } from 'node:child_process'

export const gitClone = async (url: string, ref: string, repo: string) => {
  await promisify(exec)(`git clone --depth 1 -b ${ref} ${url}`)
  await run('pnpm i', repo)
}
