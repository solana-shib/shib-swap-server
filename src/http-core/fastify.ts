import Fastify from 'fastify'

import { zodSchemaCompiler } from './fastify/zod.schema-compiler'
import { zodSerializerCompiler } from './fastify/zod.serializer-compiler'
import { httpExceptionErrorHandler } from './fastify/http-exception.error-handler'
import { Logger } from 'pino'
import { swaggerPlugin } from './fastify/plugins/swagger.plugin'

export const createCoreFastify = async (logger: Logger) => {
  const fastify = Fastify({
    logger,
  })

  fastify.setValidatorCompiler(zodSchemaCompiler)
  fastify.setSerializerCompiler(zodSerializerCompiler)
  fastify.setErrorHandler(httpExceptionErrorHandler)

  await fastify.register(swaggerPlugin)

  return await fastify
}
