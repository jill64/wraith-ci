import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'
import { decrypt } from './decrypt.js'

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  console.log('Starting task runner...')

  try {
    const { body } = event

    console.log('Decrypting...')

    // const text = await decrypt(body)
    const text = body

    console.log({ text })
  } catch (e) {
    console.error(e)
  }

  return {
    statusCode: 200,
    body: 'OK'
  }
}
