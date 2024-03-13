import { PublicKey } from '@solana/web3.js'
import { z } from 'zod'
import { NotFoundException } from '~/exceptions'
import { createRoute } from '~core/create-route'

const SOL_WRAP_ADDRESS = 'So11111111111111111111111111111111111111112'

export default createRoute({
  query: z.object({
    from: z.string(),
    to: z.string(),
    publicKey: z.string().optional(),
    useWrappedSol: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),
  }),
  handler: async ({ query }) => {
    const queryUrl = new URL('https://price.jup.ag/v4/price')

    queryUrl.searchParams.set('ids', query.to)
    queryUrl.searchParams.set('vsToken', query.from)

    const response = await fetch(queryUrl)
    const priceData = (await response.json()) as {
      data: {
        [key: string]: {
          price: number
        }
      }
    }

    if (!priceData.data[query.to]) {
      throw new NotFoundException()
    }

    const tokenFromPrice = priceData.data[query.to].price

    let fromBalance: null | number = null

    if (!query.publicKey) {
      return {
        price: tokenFromPrice,
        fromBalance: null,
      }
    }

    if (query.from === SOL_WRAP_ADDRESS && !query.useWrappedSol) {
      const account = new PublicKey(query.publicKey)
      const info = await rpcConnection.getBalance(account)
      fromBalance = info / 10 ** 9
    } else {
      const account = new PublicKey(query.publicKey)
      const info = await rpcConnection.getTokenAccountsByOwner(account, {
        mint: new PublicKey(query.from),
      })

      if (info.value.length > 0) {
        const accountPubKey = info.value[0].pubkey
        const balanceResult =
          await rpcConnection.getTokenAccountBalance(accountPubKey)
        fromBalance = balanceResult.value.uiAmount
      }
    }

    return {
      price: tokenFromPrice,
      fromBalance,
    }
  },
})
