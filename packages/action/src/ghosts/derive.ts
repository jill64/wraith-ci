import { Ghost } from '@/action/types/Ghost.js'

export const derive: Ghost = async () => {
  return 'skipped'

  // const { owner, repo } = payload

  // const { data: repository } = await octokit.rest.repos.get({
  //   owner,
  //   repo
  // })

  // const { data: list } = await octokit.rest.pulls.list({
  //   owner,
  //   repo,
  //   state: 'open',
  //   base: repository.default_branch
  // })

  // if (!list.length) {
  //   return {
  //     status: 'skipped',
  //     detail: 'No open PRs targeting the default branch were found.'
  //   }
  // }

  // const result = list.map((pull) =>
  //   octokit.rest.pulls.updateBranch({
  //     owner,
  //     repo,
  //     pull_number: pull.number
  //   })
  // )

  // await Promise.allSettled(result)

  // return {
  //   status: 'success',
  //   detail: `Updated ${result.length} PRs.`
  // }
}
