import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { OctoflarePayload } from 'octoflare'
import { ActionOctokit } from 'octoflare/action'

export type Context = {
  octokit: ActionOctokit
  payload: OctoflarePayload<WraithPayload>
}
