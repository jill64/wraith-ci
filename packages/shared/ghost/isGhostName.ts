import { schema } from './schema.js'
import type { GhostName } from './types/GhostName.js'

export const isGhostName = (x: string): x is GhostName => x in schema
