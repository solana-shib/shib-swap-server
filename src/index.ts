import { loadInit } from './init'
import pino, { Logger } from 'pino'
import { createServer } from './server'
import { config } from '~config'

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var logger: Logger<never>
}

globalThis.logger = pino()

const bootstrap = async () => {
  await loadInit()

  const server = await createServer()

  await server.listen({
    port: config.PORT,
    host: config.HOST,
  })
}

bootstrap()
  .then(() => {
    // Ignore
  })
  .catch((e) => {
    logger.error(e)
  })
