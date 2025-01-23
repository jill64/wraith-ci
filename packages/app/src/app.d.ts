import type { Database } from '$shared/db/schema'
import type { Kysely } from 'kysely'
import type { Octokit } from 'octokit'
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: Kysely<Database>
      oauth_user: {
        id: string
        name: string
        email: string
        email_verified?: boolean
        picture?: string
      }
      kit: Octokit
      installation: Awaited<
        ReturnType<Octokit['rest']['apps']['getInstallation']>
      >['data']
    }
    interface PageData {
      title: {
        en: string
        ja: string
      }
      description: {
        en: string
        ja: string
      }
    }
  }
}
