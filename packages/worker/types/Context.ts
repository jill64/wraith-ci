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
  installation: OctoflareInstallation
  createCheckRun: (name: string) => Promise<string | null>
}
