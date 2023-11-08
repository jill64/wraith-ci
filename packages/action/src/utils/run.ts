import exec from '@actions/exec'

export const run = (cmd: string) =>
  exec.getExecOutput(cmd, undefined, {
    ignoreReturnCode: true
  })
