import { onRequestHookHandler } from 'fastify'
import { UnauthorizedException } from '~/exceptions/unauthorized.exception'

export const requireAuth: onRequestHookHandler = async (req) => {
  throw new UnauthorizedException('auth_not_implemented')
}
