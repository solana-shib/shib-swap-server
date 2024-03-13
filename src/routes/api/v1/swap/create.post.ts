import { z } from 'zod'
import { SwapQuote } from '~/models/swap-quote.model'
import { createRoute } from '~core/create-route'
import { createSwapTx } from '~services/swap.service'

export default createRoute({
  body: z.object({
    quote: z.any().refine((val) => typeof val === 'object'),
    publicKey: z.string(),
    useWrappedSol: z.boolean(),
    prioritizationFee: z.coerce.number().optional(),
  }),
  handler: async ({ body }) => {
    const tx = await createSwapTx({
      quote: body.quote as SwapQuote,
      publicKey: body.publicKey,
      wrapAndUnwrapSol: body.useWrappedSol,
      prioritizationFee: body.prioritizationFee,
    })

    return {
      tx,
    }
  },
})
