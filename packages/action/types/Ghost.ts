import { CloseCheckParam } from 'octoflare'
import { Context } from './Context.js'

export type Ghost = (context: Context) => Promise<CloseCheckParam>
