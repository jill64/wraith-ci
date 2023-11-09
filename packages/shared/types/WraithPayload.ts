import { GhostName } from './GhostName.js'

export type WraithPayload = {
  ref: string
  triggered: GhostName[]
  check_run_id: number
}
