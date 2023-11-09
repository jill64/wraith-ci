import { WraithPayload } from '@/shared/types/WraithPayload.js'
import exec from '@actions/exec'
import { attempt } from '@jill64/attempt'
import { action } from 'octoflare/action'
import * as core from 'octoflare/action/core'
import * as github from 'octoflare/action/github'
import { scanner, string } from 'typescanner'
import { apps } from './apps.js'
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

  const check = await attempt(
    () =>
      octokit.rest.checks.get({
        repo,
        owner,
        check_run_id
      }),
    null
  )

  const output = check?.data.output

  if (!isValidOutput(output)) {
    console.log('Invalid checks output:', output)
    return
  }

  const { context } = github
  const details_url = `${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}/job/${context.job}`

  const { stdout } = await exec.getExecOutput(
    'gh run',
    [
      '--repo',
      `${context.repo.owner}/${context.repo.repo}`,
      'view',
      context.runId.toString(),
      '--json',
      'jobs',
      '--jq',
      `'.jobs[] | select(.name == "${context.job}") | .url'`
    ],
    {
      ignoreReturnCode: true
    }
  )

  console.log('stdout', stdout)
  const job_url = attempt(() => JSON.parse(stdout).url)
  console.log('Job URL:', job_url)

  await octokit.rest.checks.update({
    owner,
    repo,
    details_url,
    check_run_id: check_run_id.toString(),
    output: updateOutput({
      output,
      ghost_name,
      result
    }),
    status: 'in_progress'
  })
})
