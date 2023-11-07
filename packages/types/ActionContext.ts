import { workers } from '@/ghost/workers.js'
import exec from '@actions/exec'
import { ActionOctokit } from 'octoflare/action'

export type ActionContext = {
  ref: string
  exec: typeof exec
  repo: string
  owner: string
  octokit: ActionOctokit
  data: Awaited<ReturnType<typeof workers>> extends Record<string, infer U>
    ? U
    : never
}
