import { TriggerEvent } from '@/shared/types/TriggerEvent.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { attempt } from '@jill64/attempt'
import { OctoflareInstallation } from 'octoflare'
import { IssueCommentEditedEvent } from 'octoflare/webhook'

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
    return new Response('Skip Event: Comment Not By Wraith CI', {
      status: 200
    })
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
    return new Response('Skip Event: No Checkbox Changes', {
      status: 200
    })
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
    return new Response('Skip Event: PR Comment Edited, But No Trigger', {
      status: 200
    })
  }

  try {
    await installation.kit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: comment.id,
      body: before
    })
  } catch (e) {
    console.error(e)
  }

  const head_sha = commented_pr.head.sha
  const ref = commented_pr.head.ref
  const event = (
    retrigger_pr ? ('pull_request' as const) : ('push' as const)
  ) satisfies TriggerEvent

  return {
    ref,
    event,
    head_sha
  }
}
