import { OctoflareInstallation } from 'octoflare'
import { Repository, Schema } from 'octoflare/webhook'

export type WorkerContext = {
  ref: string
  repo: string
  owner: string
  head_sha: string | null
  repository: Repository
  payload: Schema
  installation: OctoflareInstallation
  createCheckRun: (name: string) => Promise<string>
}
