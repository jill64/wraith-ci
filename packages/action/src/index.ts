import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { attempt } from '@jill64/attempt'
import { unfurl } from '@jill64/unfurl'
import { action } from 'octoflare/action'
import * as core from 'octoflare/action/core'
import * as github from 'octoflare/action/github'
import { scanner, string } from 'typescanner'
import { apps } from './apps.js'
import { getJobUrl } from './utils/getJobUrl.js'
import { updateOutput } from './utils/updateOutput.js'

const isValidOutput = scanner({
  title: string,
  summary: string
})

action<WraithPayload>(async ({ octokit, payload }) => {
  const name = core.getInput('name')

  if (!(name in apps)) {
    throw new Error(`Invalid ghost name: ${name}`)
  }

  const ghost_name = name as keyof typeof apps

  const {
    repo,
    owner,
    data: { check_run_id, triggered }
  } = payload

  if (!triggered.includes(ghost_name)) {
    return
  }

  const app = apps[ghost_name]

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
    console.error('Invalid checks output:', output)
    core.setFailed('Invalid checks output')
    return
  }

  const gh = github.context
  const details_url = `${gh.serverUrl}/${gh.repo.owner}/${gh.repo.repo}/actions/runs/${gh.runId}`

  await octokit.rest.checks.update({
    owner,
    repo,
    details_url,
    check_run_id,
    output: updateOutput({
      output,
      ghost_name,
      result,
      job_url
    }),
    status: 'in_progress'
  })
})
