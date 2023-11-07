import { Ghost } from '@/types/Ghost.js'

export const deploy: Ghost = {
  worker: async ({
    ref,
    repo,
    owner,
    payload,
    installation,
    repository: { default_branch }
  }) => {
    if (!('commits' in payload)) {
      return
    }

    const { after: head_sha } = payload

    if (Number(head_sha) === 0) {
      return
    }

    if (ref !== default_branch) {
      return
    }

    const result = await installation.getFile('wrangler.toml')

    if (!result?.data) {
      return
    }

    const {
      data: { id: check_run_id }
    } = await installation.kit.rest.checks.create({
      repo,
      owner,
      name: 'Ghost Deploy',
      head_sha,
      status: 'in_progress'
    })

    return {
      check_run_id
    }
  },
  action: async ({ octokit, data, exec }) => {
    const { status, result } = data

    if (status === 'error') {
      return
    }

    const { exitCode, stdout, stderr } = await exec.getExecOutput(
      'npm run deploy',
      undefined,
      {
        ignoreReturnCode: true
      }
    )

    await octokit.rest.checks.update({
      check_run_id: result.check_run_id,
      status: 'completed',
      conclusion: exitCode ? 'failure' : 'success',
      output: exitCode
        ? {
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
        : undefined
    })
  }
}
