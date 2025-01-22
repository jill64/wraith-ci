import type { GhostName } from './GhostName.js'
import type { GhostStatus } from './GhostStatus.js'

export type WraithStatus = Partial<Record<GhostName, GhostStatus>>
