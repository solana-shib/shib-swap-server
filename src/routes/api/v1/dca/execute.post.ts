import { z } from 'zod'
import { executeDcaInitTx } from '~/services/dca.service'
import { createRoute } from '~core/create-route'

export default createRoute({
  body: z.object({
    txHash: z.string(),
    senderPublicKey: z.string(),
  }),
  handler: async ({ body }) => {
    return await executeDcaInitTx(body)
  },
})
