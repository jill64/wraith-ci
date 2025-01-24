import type { Database } from '$shared/db/schema'
import type { Kysely } from 'kysely'
import type { Octokit } from '@octokit/rest'
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: Kysely<Database>
      github_user: Awaited<
        ReturnType<Octokit['rest']['users']['getAuthenticated']>
      >['data']
      kit: Octokit
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
