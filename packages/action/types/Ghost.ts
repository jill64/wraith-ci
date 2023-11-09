import { GhostStatusShortHand } from '@/shared/types/GhostStatusShortHand.js'
import { Context } from './Context.js'

export type Ghost = (context: Context) => Promise<GhostStatusShortHand>
