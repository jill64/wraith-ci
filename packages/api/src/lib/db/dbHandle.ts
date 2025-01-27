import { SOLARSYSTEM_API_KEY } from '$env/static/private'
import { PUBLIC_STAGE } from '$env/static/public'
import type { Database } from '$shared/db/schema'
import type { Handle } from '@sveltejs/kit'
import { Kysely } from 'kysely'
import { SolarSystemDialect } from 'kysely-solarsystem'

export const dbHandle: Handle = async ({ event, resolve }) => {
  event.locals.db = new Kysely<Database>({
    dialect: new SolarSystemDialect({
      teamName: 'jill64',
      clusterName: 'WraithCI',
      branchName: PUBLIC_STAGE === 'prod' ? 'main' : 'dev',
      apiKey: SOLARSYSTEM_API_KEY
    })
  })

  return resolve(event)
}
