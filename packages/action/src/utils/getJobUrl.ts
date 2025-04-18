import { GhostName } from '$shared/ghost/types/GhostName.js'
import { ActionOctokit } from 'octoflare/action'
import * as core from 'octoflare/action/core'
import * as github from 'octoflare/action/github'

const gh = github.context

export const getJobUrl = async ({
  ghost_name,
  octokit
}: {
  ghost_name: GhostName
  octokit: ActionOctokit
}): Promise<string | undefined | null> => {
  const attempt_number = parseInt(core.getInput('run_attempt'))

  const { data: jobs } =
    await octokit.rest.actions.listJobsForWorkflowRunAttempt({
      owner: gh.repo.owner,
      repo: gh.repo.repo,
      run_id: gh.runId,
      attempt_number
    })

  const job = jobs.jobs.find(
    ({ name }) => name.startsWith('wraith-ci') && name.includes(ghost_name)
  )

  return job?.html_url
}
