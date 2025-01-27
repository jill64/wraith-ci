import { Database } from '$shared/db/schema.js'
import { Kysely } from 'kysely'
import { SolarSystemDialect } from 'kysely-solarsystem'
import { env } from 'node:process'

export const db = new Kysely<Database>({
  dialect: new SolarSystemDialect({
    teamName: 'jill64',
    clusterName: 'WraithCI',
    branchName: 'main',
    apiKey: env.SOLARSYSTEM_API_KEY!
  })
})
