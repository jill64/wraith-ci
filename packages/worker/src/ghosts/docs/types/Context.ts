import { Octokit } from 'octoflare/octokit'

export type Context = {
  owner: string
  repo: string
  octokit: Octokit
}
