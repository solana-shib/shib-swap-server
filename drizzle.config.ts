import { defineConfig } from 'drizzle-kit'

const DATABASE_URL = process.env.DATABASE_URL

if (!DATABASE_URL) throw new Error('DATABASE_URL env could not be found')

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: DATABASE_URL,
  },
  verbose: true,
  strict: true,
})
