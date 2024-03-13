import { type CreateDCAParamsV2 } from '@jup-ag/dca-sdk'
import { findTokenByAddress } from './tokens.service'
import { floatToStringInteger } from '~/utils/crypto'
import { NotFoundException } from '~/exceptions'
import { createDcaInitTransaction } from './jupiter.service'
import { encode as encodeBase58, decode as decodeBase58 } from 'bs58'
import { PublicKey, Transaction } from '@solana/web3.js'
import { executeSignedTransaction } from './transactions.service'

export type DcaInitOptions = {
  publicKey: string

  cycleSeconds: number
  inAmount: number
  inAmountPerCycle: number

  tokenFrom: string
  tokenTo: string

  minOutAmountPerCycle?: number
  maxOutAmountPerCycle?: number
}

export type ExecuteDcaInitTxOptions = {
  txHash: string
  senderPublicKey: string
}

export const createDcaInitTx = async (options: DcaInitOptions) => {
  const inputToken = await findTokenByAddress(options.tokenFrom)
  const outputToken = await findTokenByAddress(options.tokenTo)

  if (!inputToken) {
    throw new NotFoundException('input_token_not_found')
  }

  if (!outputToken) {
    throw new NotFoundException('output_token_not_found')
  }

  const params: CreateDCAParamsV2 = {
    cycleSecondsApart: options.cycleSeconds,
    inAmount: floatToStringInteger(options.inAmount, inputToken.decimals),
    inAmountPerCycle: floatToStringInteger(
      options.inAmountPerCycle,
      inputToken.decimals
    ),
    inputMint: inputToken.address,
    outputMint: outputToken?.address,
    payer: options.publicKey,
    user: options.publicKey,

    startAt: null,

    minOutAmountPerCycle: options.minOutAmountPerCycle
      ? floatToStringInteger(options.minOutAmountPerCycle, outputToken.decimals)
      : undefined,
    maxOutAmountPerCycle: options.maxOutAmountPerCycle
      ? floatToStringInteger(options.maxOutAmountPerCycle, outputToken.decimals)
      : undefined,
  }

  const tx = await createDcaInitTransaction(params)
  const blockhashData = await rpcConnection.getLatestBlockhash()
  tx.recentBlockhash = blockhashData.blockhash
  tx.feePayer = new PublicKey(options.publicKey)

  const serializedTx = tx.serialize({
    verifySignatures: false,
    requireAllSignatures: false,
  })
  const encodedTx = encodeBase58(serializedTx)

  return encodedTx
}

export const executeDcaInitTx = async (options: ExecuteDcaInitTxOptions) => {
  const sesrializedTx = decodeBase58(options.txHash)
  const tx = Transaction.from(sesrializedTx)
  const senderPublicKey = new PublicKey(options.senderPublicKey)

  return await executeSignedTransaction({
    transaction: tx,
    senderPublicKey,
  })
}
