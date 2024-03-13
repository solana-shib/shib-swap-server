import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'
import { config as configDotenv } from 'dotenv'

const { Pool } = pg

configDotenv()

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) throw new Error('DATABASE_URL env could not be found')

const connectionString = process.env.DATABASE_URL

const sql = new Pool({
  connectionString,
})

const db = drizzle(sql, { logger: true })

await migrate(db, { migrationsFolder: 'drizzle' })

await sql.end()
