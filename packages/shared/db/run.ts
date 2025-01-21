import { error } from '@sveltejs/kit'
import type {
  DeleteQueryBuilder,
  InsertQueryBuilder,
  UpdateQueryBuilder
} from 'kysely'

export const run = async <DB, TB extends keyof DB, O>(
  query:
    | UpdateQueryBuilder<DB, TB, TB, O>
    | DeleteQueryBuilder<DB, TB, O>
    | InsertQueryBuilder<DB, TB, O>
) => {
  const result = await query.executeTakeFirstOrThrow()

  if ('numUpdatedRows' in result) {
    if (result.numUpdatedRows !== 1n) {
      throw error(
        500,
        `Unexpected Updated result with ${result.numUpdatedRows} updated rows`
      )
    }
  }

  if ('numInsertedRows' in result) {
    if (result.numInsertedRows !== 1n) {
      throw error(
        500,
        `Unexpected Inserted result with ${result.numInsertedRows} inserted rows`
      )
    }
  }

  if ('numDeletedRows' in result) {
    if (result.numDeletedRows !== 1n) {
      throw error(
        500,
        `Unexpected Deleted result with ${result.numDeletedRows} deleted rows`
      )
    }
  }

  return result
}
