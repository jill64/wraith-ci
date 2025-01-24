import { getExecOutput } from '@actions/exec'

export const preRun =
  (env: Record<string, string>) =>
  (
    cmd: string,
    opt?: {
      cwd?: string
    }
  ) =>
    getExecOutput(cmd, undefined, {
      env: {
        ...(process.env as Record<string, string>),
        ...env
      },
      cwd: opt?.cwd,
      ignoreReturnCode: true
    })
