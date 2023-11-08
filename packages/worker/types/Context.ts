import { WraithPayload } from '@/shared/types/WraithPayload.js'
import { OctoflareInstallation } from 'octoflare'
import { Repository, Schema } from 'octoflare/webhook'

export type Context = {
  ref: string
  repo: string
  owner: string
  event: string
  head_sha: string | null
  repository: Repository
  payload: Schema
  installation: OctoflareInstallation<WraithPayload>
  createCheckRun: (name: string) => Promise<string | null>
}
