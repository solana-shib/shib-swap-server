import { Pool } from 'pg'
import { config } from '~config'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '~db/schema'

export type DatabaseClient = NodePgDatabase<typeof schema>

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var dbClient: DatabaseClient
}

export const initialiseDatabase = () => {
  const pool = createDatabasePool()
  globalThis.dbClient = drizzle(pool, { schema })
}

const createDatabasePool = () => {
  return new Pool({
    connectionString: config.DATABASE_URL,
  })
}
