import { initialiseDatabase } from '~db'

export const init = () => {
  initialiseDatabase()
  logger.info('DB Initialised Successfully')
}
