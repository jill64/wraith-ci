import { GhostPayload } from '@/shared/types/GhostPayload.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { ActionOctokit } from 'octoflare/action'

export type Context = {
  octokit: ActionOctokit
  payload: WraithPayload
  ghost_payload: GhostPayload
}
