import { GhostStatus } from './GhostStatus.js'

export type GhostStatusShortHand =
  | GhostStatus
  | Exclude<GhostStatus['status'], 'failure'>
