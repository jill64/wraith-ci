import { exec, ExecOptions } from 'node:child_process'
import { promisify } from 'node:util'

export const run = (
  cmd: string,
  repo: string,
  options?: {
    encoding?: BufferEncoding
  } & ExecOptions
) =>
  promisify(exec)(cmd, {
    encoding: 'utf-8',
    cwd: `/tmp/${repo}`,
    ...options
  })
