import { Ghost } from '@/types/Ghost.js'

export const deploy: Ghost = {
  worker: async ({
    ref,
    payload,
    installation,
    createCheckRun,
    repository: { default_branch }
  }) => {
    if (!('commits' in payload)) {
      return
    }

    if (ref !== default_branch) {
      return
    }

    const result = await installation.getFile('wrangler.toml')

    if (!result?.data) {
      return
    }

    const check_run_id = await createCheckRun('Ghost Deploy')

    return {
      check_run_id
    }
  },
  action: async ({ data: { status }, exec }) => {
    if (status === 'error') {
      return 'failure'
    }

    const { exitCode, stdout, stderr } = await exec.getExecOutput(
      'npm run deploy',
      undefined,
      {
        ignoreReturnCode: true
      }
    )

    if (exitCode === 0) {
      return 'success'
    }

    return {
      conclusion: 'failure',
      output: {
        title: 'Deploy Failed',
        summary: `
## stdout
\`\`\`
${stdout}
\`\`\`

## stderr
\`\`\`
${stderr}
\`\`\`
`
      }
    }
  }
}
