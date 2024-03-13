export type TokenRaw = {
  address: string
  chainId: number
  decimals: number

  name: string
  symbol: string

  logoURI?: string

  extensions?: Record<string, string>
  tags?: string[]
}
