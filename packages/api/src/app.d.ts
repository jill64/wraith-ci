import type { Database } from '$shared/db/schema'
import type { Kysely } from 'kysely'

declare global {
  namespace App {
    interface Locals {
      db: Kysely<Database>
    }
  }
}
