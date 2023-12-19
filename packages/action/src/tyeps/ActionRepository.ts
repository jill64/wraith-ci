import { ActionOctokit } from 'octoflare/action'

export type ActionRepository = Awaited<
  ReturnType<ActionOctokit['rest']['repos']['get']>
>['data']
