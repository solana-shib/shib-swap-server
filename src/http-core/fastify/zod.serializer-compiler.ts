import { FastifySerializerCompiler } from 'fastify/types/schema'
import { UnprocessableEntityException } from '~/exceptions'
import { ZodSchema } from 'zod'

export const zodSerializerCompiler: FastifySerializerCompiler<ZodSchema> = ({
  schema,
}: {
  schema: ZodSchema
}) => {
  return (data) => {
    const result = schema.safeParse(data)

    if (result.success) {
      return JSON.stringify(result.data)
    }

    throw new UnprocessableEntityException(result)
  }
}
