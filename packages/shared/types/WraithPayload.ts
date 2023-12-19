import { GhostName } from './GhostName.js'

export type WraithPayload = {
  triggered_ghosts: GhostName[]
  head_sha: string
  ref: string
}
