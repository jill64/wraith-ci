import { GhostStatusShortHand } from '$shared/ghost/types/GhostStatusShortHand.js'
import { WraithPayload } from '$shared/ghost/types/WraithPayload.js'
import { OctoflarePayload } from 'octoflare'
import { ActionOctokit } from 'octoflare/action'

export type Ghost = (context: {
  octokit: ActionOctokit
  payload: OctoflarePayload<WraithPayload>
}) => Promise<GhostStatusShortHand>
