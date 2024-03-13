import { FastifySchemaCompiler } from 'fastify'
import { ZodSchema } from 'zod'
import { UnprocessableEntityException } from '~/exceptions'

export const zodSchemaCompiler: FastifySchemaCompiler<ZodSchema> = ({
  schema,
}: {
  schema: ZodSchema
}) => {
  return (data) => {
    const result = schema.safeParse(data)
    if (result.success === true) {
      return {
        value: result.data,
      }
    } else {
      throw new UnprocessableEntityException(result.error.errors)
    }
  }
}
