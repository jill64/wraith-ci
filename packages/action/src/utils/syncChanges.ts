import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { exec } from '@actions/exec'
import { ActionOctokit } from 'octoflare/action'

export const syncChanges = async ({
  message,
  branch,
  payload,
  octokit
}: {
  message: string
  branch: string
  payload: WraithPayload
  octokit: ActionOctokit
}): Promise<'pr_created' | 'pushed'> => {
  const { default_branch, ref, event, repo, owner } = payload

  const now_default_branch = ref === default_branch
  const is_push_event = event === 'push'

  const head_branch = now_default_branch ? branch : ref
  const require_new_branch = now_default_branch || !is_push_event

  if (require_new_branch) {
    await exec('git checkout -b', [head_branch])
  }

  await exec('git add .')
  await exec('git commit', ['-m', message])

  if (require_new_branch) {
    await exec('git push origin')

    await octokit.rest.pulls.create({
      owner,
      repo,
      title: message,
      head: head_branch,
      base: default_branch
    })

    return 'pr_created'
  }

  await exec('git pull --rebase')
  await exec('git push origin')

  return 'pushed'
}
