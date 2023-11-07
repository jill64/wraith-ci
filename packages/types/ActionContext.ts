import { workers } from '@/ghost/workers.js'
import { ActionOctokit } from 'octoflare/action'

export type ActionContext = {
  repo: string
  owner: string
  octokit: ActionOctokit
  data: Awaited<ReturnType<typeof workers>> extends Record<string, infer U>
    ? U
    : never
}
