import type { Database } from '$shared/db/schema'
import type { D1Database } from '@cloudflare/workers-types'
import type { Kysely } from 'kysely'

declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      db: Kysely<Database>
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
    interface Platform {
      env: {
        D1: D1Database
      }
    }
  }
}
