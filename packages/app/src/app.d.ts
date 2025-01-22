import type { Database } from '$shared/db/schema'
import type { Kysely } from 'kysely'

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
