import { OctoflarePayload } from 'octoflare'
import { GhostName } from './GhostName.js'
import { GhostPayload } from './GhostPayload.js'

export type WraithPayload = Omit<OctoflarePayload, 'token' | 'app_token'> & {
  ghosts: Record<GhostName, GhostPayload>
  ref: string
  default_branch: string
  event: 'push' | 'unknown'
}
