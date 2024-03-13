import { DCA, Network, type CreateDCAParamsV2 } from '@jup-ag/dca-sdk'
import { SwapQuote, SwapQuoteError } from '~models/swap-quote.model'

const JUPITER_QUOTE_API_BASE_URL = 'https://quote-api.jup.ag'
const dca = new DCA(rpcConnection, Network.MAINNET)

// https://station.jup.ag/docs/apis/swap-api#4-get-the-route-for-a-swap
export type FetchSwapRouteOptions = {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number

  platformFeeBps?: number
  onlyDirectRoutes?: boolean
  asLegacyTransaction?: boolean
  maxAccounts?: number
}

export type CreateSerializedTransactionOptions = {
  quoteResponse: object
  userPublicKey: string
  wrapAndUnwrapSol: boolean
  feeAccount?: string
  prioritizationFeeLamports?: number | 'auto'
}

type CreateSerializedTransactionResponse = {
  swapTransaction: string
}

type PlainObject = {
  [key: string]: string | number | boolean | undefined
}

export const createSerializedSwapTransaction = async (
  options: CreateSerializedTransactionOptions
) => {
  const url = new URL('/v6/swap', JUPITER_QUOTE_API_BASE_URL)

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })

  const responseBody =
    (await response.json()) as CreateSerializedTransactionResponse

  return responseBody.swapTransaction
}

export const fetchSwapRouteQuote = async (options: FetchSwapRouteOptions) => {
  const urlSearchParams = createUrlSearchParamsFromPlainObject(options)
  const url = new URL(
    `/v6/quote?${urlSearchParams}`,
    JUPITER_QUOTE_API_BASE_URL
  )

  const response = await fetch(url)
  const responseBody = await response.json()

  return responseBody as SwapQuote | SwapQuoteError
}

export const createDcaInitTransaction = async (params: CreateDCAParamsV2) => {
  const { tx } = await dca.createDcaV2(params)
  return tx
}

// Is required as URLSearchParams constructor can only accept Record<string,string>
// TODO: move to utils/
const createUrlSearchParamsFromPlainObject = (obj: PlainObject) => {
  const objEntries = Object.entries(obj)

  const searchParamsEntries = objEntries
    .map<[string, string] | []>(([key, value]) => {
      if (typeof value === 'undefined') {
        return []
      }

      if (typeof value === 'object') {
        throw new Error('Cannot convert object to URLSearchParams entry')
      }

      return [key, String(value)]
    })
    .filter((val) => val.length !== 0)

  return new URLSearchParams(searchParamsEntries)
}
