import { TokenRaw } from '~models/token-raw.model'
import {
  and,
  arrayOverlaps,
  count,
  desc,
  eq,
  inArray,
  not,
  sql,
} from 'drizzle-orm'
import { tokenListRevalidations, tokens } from '~db/schema'
import { Token, TokenInsert } from '~db/types'
import chunk from 'lodash/chunk'

const TOKEN_LIST_URL = 'https://token.jup.ag/all'

// 6 hours
const REVALIDATION_INTERVAL = 1000 * 60 * 60 * 6

let isTokenListRevalidating = false

export type TokenFilterOptions = {
  verifiedOnly?: boolean
  searchQuery?: string
}

export const findTokenByAddress = async (address: string) => {
  return await dbClient.query.tokens.findFirst({
    where: eq(tokens.address, address),
  })
}

export const getTokensCount = async (filter: TokenFilterOptions) => {
  const result = await dbClient
    .select({
      tokensCount: count(tokens),
    })
    .from(tokens)
    .where(createTokenSqlFilter(filter))

  return result[0].tokensCount
}

export const getTokensList = async (
  options: {
    skip: number
    limit: number
  } & TokenFilterOptions
) => {
  const tokensList = await dbClient.query.tokens.findMany({
    where: createTokenSqlFilter(options),
    limit: options.limit,
    offset: options.skip,
  })

  // Starts in parallel so it doesn't block users's tokens request
  revalidateTokenListIfRequired()

  return tokensList
}

const createTokenSqlFilter = ({
  verifiedOnly = false,
  searchQuery = '',
}: TokenFilterOptions) => {
  const searchSqlQuery = `%${searchQuery}%`

  return and(
    sql`CONCAT(${tokens.name}, ${tokens.symbol}) LIKE ${searchSqlQuery}`,
    verifiedOnly ? not(arrayOverlaps(tokens.tags, ['unknown'])) : sql`TRUE`
  )
}

const revalidateTokenListIfRequired = async () => {
  const needsRevalidation = await getTokenListNeedsRevalidation()

  if (needsRevalidation) {
    await revalidateTokenList()
  }
}

const revalidateTokenList = async () => {
  logger.info('Started token list revalidation')

  if (isTokenListRevalidating) {
    logger.info('Token list is already revalidating')
    return
  }

  isTokenListRevalidating = true

  const fetchedTokens = await fetchTokensList()
  const currentTokens = await dbClient.select().from(tokens)

  const difference = getTokenListDifference(fetchedTokens, currentTokens)

  await createTokensFromRawList(difference.toCreate)
  await removeTokensByInstances(difference.toDelete)

  const revalidation = await dbClient
    .insert(tokenListRevalidations)
    .values({
      fetchedTokensCount: fetchedTokens.length,
      removedTokensCount: difference.toDelete.length,
      addedTokensCount: difference.toCreate.length,
    })
    .returning()

  logger.info(revalidation, 'Token list successfully revalidated')

  isTokenListRevalidating = false
}

const removeTokensByInstances = async (tokensInstances: Token[]) => {
  if (tokensInstances.length === 0) {
    return
  }

  const tokensAddresses = tokensInstances.map((val) => val.address)
  await dbClient
    .update(tokens)
    .set({
      removed: true,
    })
    .where(inArray(tokens.address, tokensAddresses))
}

const createTokensFromRawList = async (tokensRaw: TokenRaw[]) => {
  // This interesting implementation is required due to this issue:
  // https://github.com/drizzle-team/drizzle-orm/issues/1740

  const chunks = chunk(tokensRaw, 500)

  for (const chunk of chunks) {
    // Could be made in paralell though
    await dbClient.insert(tokens).values(
      chunk.map(
        (val) =>
          ({
            address: val.address,
            chainId: val.chainId,
            decimals: val.decimals,
            logoUrl: val.logoURI,
            name: val.name,
            symbol: val.symbol,
            extensions: val.extensions,
            tags: val.tags,
          }) satisfies TokenInsert
      )
    )
  }
}

const getTokenListDifference = (
  fetchedTokens: TokenRaw[],
  savedTokens: Token[]
): {
  toCreate: TokenRaw[]
  toDelete: Token[]
} => {
  const toCreate: TokenRaw[] = []
  const toDelete: Token[] = []

  for (const fetchedToken of fetchedTokens) {
    const savedToken = savedTokens.find(
      (savedToken) => savedToken.address === fetchedToken.address
    )

    if (savedToken) {
      continue
    }

    toCreate.push(fetchedToken)
  }

  for (const savedToken of savedTokens) {
    const fetchedToken = fetchedTokens.find(
      (fetchedToken) => fetchedToken.address === savedToken.address
    )

    if (fetchedToken) {
      continue
    }

    toDelete.push(savedToken)
  }

  return {
    toCreate,
    toDelete,
  }
}

const getTokenListNeedsRevalidation = async () => {
  const lastRevalidatedAt = await getLastTokenListRevalidatedAt()

  return Date.now() > lastRevalidatedAt.getTime() + REVALIDATION_INTERVAL
}

const getLastTokenListRevalidatedAt = async () => {
  const result = await dbClient
    .select({
      revalidatedAt: tokenListRevalidations.createdAt,
    })
    .from(tokenListRevalidations)
    .orderBy(desc(tokenListRevalidations.createdAt))
    .limit(1)

  if (result.length === 0) {
    return new Date(0)
  }

  return result[0].revalidatedAt
}

const fetchTokensList = async (): Promise<TokenRaw[]> => {
  const response = await fetch(TOKEN_LIST_URL)

  if (response.status !== 200) {
    throw new Error(`Could not fetch tokens list. Status ${response.status}`)
  }

  const responseData = await response.json()

  if (
    !responseData ||
    typeof responseData !== 'object' ||
    !Array.isArray(responseData)
  ) {
    throw new Error(
      `Could not fetch tokens list. Expected object array, got ${typeof responseData}`
    )
  }

  return responseData
}
