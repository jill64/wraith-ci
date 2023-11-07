import { OctoflareInstallation } from 'octoflare'
import { Repository, Schema } from 'octoflare/webhook'

export type WorkerContext = {
  ref: string
  repo: string
  owner: string
  repository: Repository
  payload: Schema
  installation: OctoflareInstallation
}
