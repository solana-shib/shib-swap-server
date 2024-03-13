import { FastifyReply, FastifyRequest } from 'fastify'
import { HttpException } from '~/exceptions'

export const httpExceptionErrorHandler = async (
  error: HttpException,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  logger.error(error, 'Error happened while trying to perform the request')

  if ('status' in error) {
    return await reply.status(error.status).send({
      status: error.status,
      message: error.message,
      details: error.details,
    })
  } else {
    request.server.log.error(error)

    return await reply.status(500).send({
      status: 500,
      message: 'Internal Server Error',
    })
  }
}
