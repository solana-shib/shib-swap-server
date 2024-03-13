import { createRoute } from '~core/create-route'

export default createRoute({
  handler: async () => {
    return {
      alive: true,
    }
  },
})
