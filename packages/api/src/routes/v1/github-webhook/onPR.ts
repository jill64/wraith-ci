import type { TriggerEvent } from '$shared/ghost/types/TriggerEvent.js'
import type { WraithPayload } from '$shared/ghost/types/WraithPayload'
import type { PullRequestEvent } from '@octokit/webhooks-types'
import type { OctoflareInstallation } from 'octoflare'

export const onPR = async (
  { action, pull_request }: PullRequestEvent,
  {
    repo,
    owner,
    installation
  }: {
    repo: string
    owner: string
    installation: OctoflareInstallation<WraithPayload>
  }
) => {
  if (
    action !== 'opened' &&
    action !== 'reopened' &&
    action !== 'synchronize'
  ) {
    return new Response(
      'Skip Event: PR is not Opened, Reopened, or Synchronized',
      {
        status: 200
      }
    )
  }

  const ref = pull_request.head.ref
  const event = 'pull_request' as const satisfies TriggerEvent
  const head_sha = pull_request.head.sha

  const task = async () => {
    try {
      const { data } = await installation.rest.issues.listComments({
        owner,
        repo,
        issue_number: pull_request.number
      })

      if (
        !data.some(
          ({ user, body }) =>
            user?.login === 'wraith-ci[bot]' &&
            body?.includes('] Wraith CI / PR')
        )
      ) {
        await installation.rest.issues.createComment({
          owner,
          repo,
          issue_number: pull_request.number,
          body: `## Wraith CI 👻 Retry Request

Check the box to re-trigger CI.  

- [ ] Wraith CI
- [ ] Wraith CI / PR
`
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  const pull_number = pull_request.number

  return {
    ref,
    task,
    event,
    head_sha,
    pull_number
  }
}
