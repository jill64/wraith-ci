import { GhostName } from '../types/GhostName.js'
import { schema } from './schema.js'

export const isGhostName = (x: string): x is GhostName => x in schema
