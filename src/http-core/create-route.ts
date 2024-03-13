import {
  HTTPMethods,
  FastifyRequest,
  FastifyReply,
  RouteOptions,
  FastifySchema,
  preHandlerAsyncHookHandler,
  onRequestHookHandler,
} from 'fastify'
import { ZodTypeAny, z } from 'zod'

import { requireAuth } from './fastify/hooks/require-auth'
import { Application } from '@prisma/client'

type Guard<TRequest extends FastifyRequest> = (req: TRequest) => Promise<any>

export type ContentType = 'application/json'

export type Route<
  Body extends ZodTypeAny,
  Query extends ZodTypeAny,
  Params extends ZodTypeAny,
  Headers extends ZodTypeAny,
  Request extends FastifyRequest<{
    Body: z.infer<Body>
    Querystring: z.infer<Query>
    Params: z.infer<Params>
    Headers: z.infer<Headers>
  }>,
> = {
  method?: HTTPMethods
  body?: Body
  query?: Query
  url?: string
  params?: Params
  contentType?: ContentType
  headers?: Headers
  preHandlers?: Array<preHandlerAsyncHookHandler>
  onRequest?: Array<onRequestHookHandler>
  tag?: string
} & (
  | {
      auth: true
      handler: (
        req: Request & {
          application: Application
        },
        rep: FastifyReply
      ) => any
      guard?:
        | Array<Guard<Request & { application: Application }>>
        | Guard<Request & { application: Application }>
    }
  | {
      auth?: false
      handler: (req: Request, rep: FastifyReply) => any
      guard?: Array<Guard<Request>> | Guard<Request>
    }
)

export function createRoute<
  B extends ZodTypeAny,
  Q extends ZodTypeAny,
  P extends ZodTypeAny,
  H extends ZodTypeAny,
  Request extends FastifyRequest<{
    Body: z.infer<B>
    Querystring: z.infer<Q>
    Params: z.infer<P>
    Headers: z.infer<H>
  }>,
>(route: Route<B, Q, P, H, Request>): RouteOptions {
  const schema: FastifySchema = {}
  if (route.body) schema.body = route.body
  if (route.query) schema.querystring = route.query
  if (route.params) schema.params = route.params
  if (route.headers) schema.headers = route.headers

  const onRequest = route.onRequest ?? Array<onRequestHookHandler>(0)

  if (route.auth) {
    onRequest.push(requireAuth)
  }

  let preHandler = route.preHandlers ?? []

  if (route.guard) {
    preHandler = preHandler.concat(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Array.isArray(route.guard) ? route.guard : [route.guard]
    )
  }

  return {
    url: route.url ?? '/',
    method: route.method ?? 'GET',
    schema: route.auth
      ? {
          ...schema,
          security: [
            {
              apiKey: [],
            },
          ],
          tags: route.tag ? [route.tag] : undefined,
        }
      : schema,
    preHandler,
    onRequest,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    handler: route.handler,
  }
}
