import Decimal from 'decimal.js'

// Convert float amount of token in its integer representation
export const floatToStringInteger = (
  amount: number,
  decimals: number
): string => {
  const decimalsMultiplyFactor = new Decimal(10).pow(decimals)
  const amountDecimal = new Decimal(amount).mul(decimalsMultiplyFactor).round()

  return amountDecimal.toString()
}

// Convert integer amount of token in float
export const stringIntegerToFloat = (
  amount: string,
  decimals: number
): number => {
  const decimalsMultiplyFactor = new Decimal(10).pow(decimals)
  const amountDecimal = new Decimal(amount).div(decimalsMultiplyFactor)

  return amountDecimal.toNumber()
}
