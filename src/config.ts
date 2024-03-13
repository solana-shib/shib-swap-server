import { z } from 'zod'
import { config as configDotenv } from 'dotenv'

configDotenv()

const ConfigSchema = z.object({
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  RPC_URL: z.string().url(),
  DATABASE_URL: z.string(),
  FEE_ACCOUNT: z.string().optional(),
  FEE_ACCOUNT_PRIVATE_KEY: z.string().optional(),
  FEE_ACCOUNT_PUBLIC_KEY: z.string().optional()
})

export const config = ConfigSchema.parse(process.env)
