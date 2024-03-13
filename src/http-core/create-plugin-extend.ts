import { FastifyPluginAsync } from 'fastify'

export const createPluginExtend = (fastifyPlugin: FastifyPluginAsync) => ({
  identity: 'plugin_extend',
  fastifyPlugin,
})
