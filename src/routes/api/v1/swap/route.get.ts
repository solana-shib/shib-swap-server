import { z } from 'zod'
import { createRoute } from '~core/create-route'
import { getSwapRoute } from '~services/swap.service'

export default createRoute({
  query: z.object({
    inputMint: z.string(),
    outputMint: z.string(),
    amount: z.coerce.number(),
    slippage: z.coerce.number(),
    onlyDirectRoute: z
      .string()
      .default('false')
      .transform((val) => val === 'true'),
  }),
  handler: async ({ query }) => {
    return await getSwapRoute(query)
  },
})
