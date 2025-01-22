import { GhostName } from './GhostName.js'
import { GhostStatus } from './GhostStatus.js'

export type WraithStatus = Partial<Record<GhostName, GhostStatus>>
