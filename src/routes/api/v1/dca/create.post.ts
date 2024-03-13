import { z } from 'zod'
import { createDcaInitTx } from '~/services/dca.service'
import { createRoute } from '~core/create-route'

export default createRoute({
  body: z.object({
    publicKey: z.string(),

    cycleSeconds: z.number(),
    inAmount: z.number(),
    inAmountPerCycle: z.number(),

    tokenFrom: z.string(),
    tokenTo: z.string(),

    minOutAmountPerCycle: z.number().optional(),
    maxOutAmountPerCycle: z.number().optional(),
  }),
  handler: async ({ body }) => {
    const tx = await createDcaInitTx(body)

    return {
      tx,
    }
  },
})
