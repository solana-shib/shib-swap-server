import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js'
import { BadRequestException } from '~/exceptions'

export type ExecuteSignedTransactionOptions = {
  transaction: Transaction | VersionedTransaction
  senderPublicKey: PublicKey
}

export const executeSignedTransaction = async ({
  transaction,
  senderPublicKey,
}: ExecuteSignedTransactionOptions) => {
  const txSignature = await rpcConnection.sendRawTransaction(
    transaction.serialize(),
    {
      skipPreflight: true,
    }
  )

  const blockhashData = await rpcConnection.getLatestBlockhash()

  const response = await rpcConnection.confirmTransaction({
    blockhash: blockhashData.blockhash,
    lastValidBlockHeight: blockhashData.lastValidBlockHeight,
    signature: txSignature,
  })

  const responseError = response.value.err

  if (responseError) {
    throw new BadRequestException({
      reason: 'transaction_failed',
      responseError,
    })
  }
  return { txSignature }
}

// const trySimulateTransaction = async (
//   tx: Transaction | VersionedTransaction,
//   senderPublicKey: PublicKey
// ): Promise<
//   | ({ success: false } & ({ simulationError: any } | { error: any }))
//   | { success: true }
// > => {
//   try {
//     const simulationResult =
//       tx instanceof VersionedTransaction
//         ? await rpcConnection.simulateTransaction(tx, {
//             sigVerify: true,
//           })
//         : await rpcConnection.simulateTransaction(tx)

//     const simulationError = simulationResult.value.err

//     if (simulationError) {
//       return {
//         success: false,
//         simulationError,
//       }
//     }

//     return {
//       success: true,
//     }
//   } catch (e) {
//     return {
//       success: false,
//       error: (e as any).message,
//     }
//   }
// }
