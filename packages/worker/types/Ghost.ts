import { GhostPayload } from '@/shared/types/GhostPayload.js'
import { CloseCheckParam } from 'octoflare'
import { Context } from './Context.js'

export type Ghost = (
  context: Context
) => Promise<GhostPayload | CloseCheckParam | void>
