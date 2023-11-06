import { OctoflareInstallation } from 'octoflare'
import { Repository, Schema } from 'octoflare/webhook'

export type WorkerContext = {
  repo: string
  owner: string
  repository: Repository
  payload: Schema
  installation: OctoflareInstallation
}
