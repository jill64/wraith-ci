import { GhostName } from './GhostName.js'
import { GhostPayload } from './GhostPayload.js'

export type WraithPayload = {
  ghosts: Record<GhostName, GhostPayload>
  ref: string
  default_branch: string
  event: 'push' | 'unknown'
}
