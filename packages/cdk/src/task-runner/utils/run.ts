import { exec, ExecOptions } from 'node:child_process'
import { promisify } from 'node:util'

export const run = (
  cmd: string,
  options?: {
    encoding?: BufferEncoding
  } & ExecOptions
) =>
  promisify(exec)(cmd, {
    encoding: 'utf-8',
    cwd: '/tmp',
    ...options
  })
