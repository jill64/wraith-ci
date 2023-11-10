import { GhostStatusShortHand } from '@/shared/types/GhostStatusShortHand.js'
import { TriggerEvent } from '@/shared/types/TriggerEvent.js'
import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { OctoflareInstallation } from 'octoflare'
import { Repository, Schema } from 'octoflare/webhook'

export type Ghost = (context: {
  ref: string
  repo: string
  owner: string
  event: TriggerEvent
  payload: Schema
  package_json: {
    data: unknown
    sha: string
  } | null
  head_sha: string
  repository: Repository
  installation: OctoflareInstallation<WraithPayload>
}) => Promise<GhostStatusShortHand>
