import { Connection } from '@solana/web3.js'
import { config } from '~config'

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var rpcConnection: Connection
}

export const init = () => {
  globalThis.rpcConnection = new Connection(config.RPC_URL, 'confirmed')
}
