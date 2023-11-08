import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { CloseCheckParam } from 'octoflare'
import { action } from 'octoflare/action'
import * as core from 'octoflare/action/core'
import * as github from 'octoflare/action/github'
import { apps } from './apps.js'

action<WraithPayload>(async (context) => {
  const { octokit } = context

  const payload = context.payload
  const app_name = core.getInput('name') as keyof typeof apps

  if (!Object.keys(apps).includes(app_name)) {
    core.setFailed(`Invalid app name: ${app_name}`)
    return
  }

  const {
    data: { ghosts },
    repo,
    owner
  } = payload

  if (!(app_name in ghosts)) {
    return
  }

  const ghost_payload = ghosts[app_name]

  if (!ghost_payload) {
    return
  }

  const ghost = apps[app_name]

  const { check_run_id } = ghost_payload

  const gh = github.context
  const details_url = `${gh.serverUrl}/${gh.repo.owner}/${gh.repo.repo}/actions/runs/${gh.runId}`

  const closeCheckRun = (param: CloseCheckParam) =>
    octokit.rest.checks.update({
      ...(typeof param === 'string' ? { conclusion: param } : param),
      check_run_id,
      owner,
      repo,
      status: 'completed',
      details_url
    })

  try {
    const result = await ghost({
      octokit,
      payload,
      ghost_payload
    })

    if (result) {
      await closeCheckRun(result)
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e))

    core.setFailed(error)

    await closeCheckRun({
      conclusion: 'failure',
      output: {
        title: 'Unhandled Action Error',
        summary: error.message
      }
    })
  }
})
