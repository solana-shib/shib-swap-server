/* eslint-disable no-use-before-define */

export interface SwapQuote {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee: PlatformFee
  priceImpactPct: string
  routePlan: RoutePlanItem[]
  contextSlot: number
  timeTaken: number
}

export interface SwapQuoteError {
  error: string
}

export interface PlatformFee {
  amount: string
  feeBps: number
}

export interface RoutePlanItem {
  swapInfo: SwapInfo
  percent: number
}

export interface SwapInfo {
  ammKey: string
  label: string
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  feeAmount: string
  feeMint: string
}
