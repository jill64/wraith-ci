import { GhostStatusShortHand } from '@/shared/types/GhostStatusShortHand.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { OctoflarePayload } from 'octoflare'
import { ActionOctokit } from 'octoflare/action'

export type Ghost = (context: {
  octokit: ActionOctokit
  payload: OctoflarePayload<WraithPayload>
}) => Promise<GhostStatusShortHand>
