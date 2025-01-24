import { schema } from '$shared/ghost/schema.js'
import { WraithPayload } from '$shared/ghost/types/WraithPayload.js'
import { attempt } from '@jill64/attempt'
import { unfurl } from '@jill64/unfurl'
import { action } from 'octoflare/action'
import * as core from 'octoflare/action/core'
import { scanner, string } from 'typescanner'
import { apps } from './apps.js'
import { getJobUrl } from './utils/getJobUrl.js'
import { updateOutput } from './utils/updateOutput.js'
import { injectEnvs } from './utils/injectEnvs.js'

const isValidOutput = scanner({
  title: string,
  summary: string
})

action<WraithPayload>(
  async ({ octokit, payload, updateCheckRun }) => {
    const name = core.getInput('name')

    if (!(name in schema)) {
      core.setFailed(`Invalid ghost name: ${name}`)
      return
    }

    const ghost_name = name as keyof typeof schema

    const {
      repo,
      owner,
      check_run_id,
      data: { triggered_ghosts }
    } = payload

    if (!triggered_ghosts.includes(ghost_name)) {
      return
    }

    const app = apps[ghost_name]

    await injectEnvs(payload.data.encrypted_envs)

    const result = await attempt(
      () =>
        app({
          octokit,
          payload
        }),
      (e, o) => ({
        status: 'failure' as const,
        detail: e?.message ?? String(o)
      })
    )

    if (typeof result === 'object' && result.status === 'failure') {
      core.setFailed(result.detail)
    }

    if (check_run_id === undefined) {
      core.setFailed('Missing check_run_id')
      return
    }

    const { check, job_url } = await unfurl({
      check: attempt(
        () =>
          octokit.rest.checks.get({
            repo,
            owner,
            check_run_id
          }),
        null
      ),
      job_url: attempt(() => getJobUrl({ ghost_name, octokit }), '')
    })

    const output = check?.data.output

    if (!isValidOutput(output)) {
      core.setFailed(
        `Invalid checks output: ${JSON.stringify(output, null, 2)}`
      )
      return
    }

    await updateCheckRun(
      updateOutput({
        output,
        ghost_name,
        result,
        job_url
      })
    )
  },
  {
    skipTokenRevocation: true
  }
)
