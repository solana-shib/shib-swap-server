import swagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'
import { jsonSchemaTransform } from 'fastify-type-provider-zod'
import fastifyPlugin from 'fastify-plugin'

export const swaggerPlugin = fastifyPlugin(async (fastify: FastifyInstance) => {
  await fastify.register(swagger, {
    transform: jsonSchemaTransform,
    swagger: {
      info: {
        title: 'SHIB Swap Core API',
        description: '',
        version: '0.1.0',
      },
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        apiKey: {
          type: 'apiKey',
          name: 'X-Api-Key',
          in: 'header',
        },
      },
    },
  })

  await fastify.register(fastifySwaggerUi)
})
