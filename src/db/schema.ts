import {
  text,
  timestamp,
  varchar,
  pgTable,
  smallint,
  integer,
  jsonb,
  decimal,
  uuid,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

const solanaAddress = (name: string) => varchar(name, { length: 44 })
const solanaTxSignature = (name: string) => varchar(name, { length: 90 })

export const users = pgTable('users', {
  address: solanaAddress('address').primaryKey(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const usersRelations = relations(users, ({ many }) => ({
  swapRequests: many(swapRequests),
}))

export const tokens = pgTable('tokens', {
  address: solanaAddress('address').primaryKey(),
  chainId: smallint('chain_id').notNull(),
  decimals: smallint('decimals').notNull(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  logoUrl: text('logo_url'),
  tags: text('tags').array().default([]).notNull(),
  extensions: jsonb('extensions'),
  removed: boolean('removed').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tokensRelations = relations(tokens, ({ many }) => ({
  swapRequestsFrom: many(swapRequests, { relationName: 'token_from' }),
  swapRequestsTo: many(swapRequests, { relationName: 'token_to' }),
}))

export const swapRequests = pgTable('swap_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  txSignature: solanaTxSignature('tx_signature').unique(),
  userAddress: solanaAddress('address').references(() => users.address),
  tokenFromAddress: solanaAddress('token_from_address')
    .notNull()
    .references(() => tokens.address),
  tokenToAddress: solanaAddress('token_to_address')
    .notNull()
    .references(() => tokens.address),
  amountFrom: decimal('amount_from').notNull(),
  amountTo: decimal('amount_to').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const swapRequestsRelations = relations(swapRequests, ({ one }) => ({
  user: one(users, {
    fields: [swapRequests.userAddress],
    references: [users.address],
  }),
  tokenFrom: one(tokens, {
    fields: [swapRequests.tokenFromAddress],
    references: [tokens.address],
    relationName: 'token_from',
  }),
  tokenTo: one(tokens, {
    fields: [swapRequests.tokenToAddress],
    references: [tokens.address],
    relationName: 'token_to',
  }),
}))

export const tokenListRevalidations = pgTable('token_list_revalidations', {
  id: uuid('id').defaultRandom().primaryKey(),
  swapRequestTxSignature: solanaTxSignature('swap_request_tx_signature')
    .unique()
    .references(() => swapRequests.txSignature),
  fetchedTokensCount: integer('fetched_tokens_count').notNull(),
  addedTokensCount: integer('added_tokens_count').notNull(),
  removedTokensCount: integer('removed_tokens_count').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const catpointRewardStatus = pgEnum('catpoint_reward_status', [
  'PENDING',
  'SUCCESSFUL',
  'ERROR',
])

export const catpointRewardErrorReason = pgEnum(
  'catpoint_reward_error_reason',
  ['MAX_RETRIES_EXCEEDED']
)

export const catpointRewards = pgTable('catpoints_rewards', {
  swapTxSignature: solanaTxSignature('swap_tx_signature').primaryKey(),
  txSignature: solanaTxSignature('tx_signature'),
  errorReason: catpointRewardErrorReason('error_reason'),
  status: catpointRewardStatus('status').notNull().default('PENDING'),
  amount: decimal('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type CatpointRewardErrorReason =
  (typeof catpointRewardErrorReason.enumValues)[number]
