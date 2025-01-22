import { getExecOutput } from '@actions/exec'

export const run = (cmd: string) =>
  getExecOutput(cmd, undefined, {
    ignoreReturnCode: true
  })
