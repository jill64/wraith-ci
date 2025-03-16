import type { TriggerEvent } from '$shared/ghost/types/TriggerEvent.js'
import type { WraithPayload } from '$shared/ghost/types/WraithPayload'
import { attempt } from '@jill64/attempt'
import type { IssueCommentEditedEvent } from 'octoflare/webhook'
import { text } from '@sveltejs/kit'
import type { OctoflareInstallation } from 'octoflare'

export const onPRCommentEdited = async (
  { issue, comment, changes }: IssueCommentEditedEvent,
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
  if (comment.user.login !== 'wraith-ci[bot]') {
    return text('Skip Event: Comment Not By Wraith CI')
  }

  const before = changes.body?.from ?? ''
  const after = comment.body

  const unchecked = '- [ ]'
  const checked = '- [x]'

  const push = 'Wraith CI'
  const pr = 'Wraith CI / PR'

  const retrigger_push =
    before.includes(`${unchecked} ${push}`) &&
    after.includes(`${checked} ${push}`)

  const retrigger_pr =
    before.includes(`${unchecked} ${pr}`) && after.includes(`${checked} ${pr}`)

  if (!(retrigger_push || retrigger_pr)) {
    return text('Skip Event: No Checkbox Changes')
  }

  const commented_pr = await attempt(async () => {
    const { data } = await installation.kit.rest.pulls.get({
      pull_number: issue.number,
      owner,
      repo
    })

    return data.state === 'open' ? data : null
  }, null)

  if (!commented_pr) {
    return text('Skip Event: PR Comment Edited, But No Trigger')
  }

  const head_sha = commented_pr.head.sha
  const ref = commented_pr.head.ref
  const event = (
    retrigger_pr ? ('pull_request' as const) : ('push' as const)
  ) satisfies TriggerEvent

  const task = async () => {
    try {
      await Promise.allSettled([
        installation.kit.rest.issues.updateComment({
          owner,
          repo,
          comment_id: comment.id,
          body: before
        }),
        installation.kit.rest.reactions.createForIssueComment({
          owner,
          repo,
          comment_id: comment.id,
          content: '+1'
        })
      ])
    } catch (e) {
      console.error(e)
    }
  }

  const pull_number = commented_pr.number

  return {
    ref,
    task,
    event,
    head_sha,
    pull_number
  }
}
