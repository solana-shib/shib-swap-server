import { createCoreFastify } from '~core/fastify'
import { autoRoute } from '~core/auto-route'
import { createPlugin } from '~core/create-plugin'
import { resolve as resolvePath } from 'path'
import fastifyCors from '@fastify/cors'

export const createServer = async () => {
  const fastify = await createCoreFastify(logger)

  await fastify.register(fastifyCors, {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
    credentials: true,
  })

  const autoRoutePluginConfig = await autoRoute(
    resolvePath(__dirname, './routes')
  )
  const autoRoutePlugin = createPlugin(autoRoutePluginConfig)

  await fastify.register(autoRoutePlugin)

  return fastify
}
