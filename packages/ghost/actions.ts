import { ActionContext } from '@/types/ActionContext.js'
import { WraithPayload } from '@/types/WraithPayload.js'
import { CloseCheckParam } from 'octoflare'
import * as core from 'octoflare/action/core'
import * as github from 'octoflare/action/github'
import { apps } from './apps.js'

export const actions = (
  context: Omit<ActionContext, 'data'> & { data: WraithPayload | Error }
) =>
  Promise.allSettled(
    Object.entries(apps).map(async ([name, app]) => {
      const data =
        context.data instanceof Error
          ? {
              status: 'error' as const,
              result: context.data
            }
          : context.data[name]

      if (!data) {
        return
      }

      const { repo, owner, octokit } = context
      const gh = github.context

      const details_url = `${gh.serverUrl}/${gh.repo.owner}/${gh.repo.repo}/actions/runs/${gh.runId}`

      const closeCheckRun = async (param: CloseCheckParam) => {
        const { status, result } = data

        if (status === 'error') {
          return
        }

        const check_run_id = result.check_run_id

        if (!check_run_id) {
          return
        }

        const outputs =
          typeof param === 'string' ? { conclusion: param } : param

        await octokit.rest.checks.update({
          check_run_id,
          owner,
          repo,
          status: 'completed',
          details_url,
          ...outputs
        })
      }

      try {
        const result = await app.action?.({
          ...context,
          data
        })

        if (!result) {
          return
        }

        await closeCheckRun(result)
      } catch (e) {
        const error = e instanceof Error ? e : new Error(String(e))

        core.setFailed(error)

        if (data.status !== 'success') {
          return
        }

        await closeCheckRun({
          conclusion: 'failure',
          output: {
            title: 'Unhandled Action Error',
            summary: error.message
          }
        })
      }
    })
  )
