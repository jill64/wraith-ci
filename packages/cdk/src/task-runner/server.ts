import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'
import { decrypt } from './decrypt.js'

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  const { body } = event

  try {
    const text = await decrypt(body)
    console.log({ text })
  } catch (e) {
    console.error(e)
  }

  return {
    statusCode: 200,
    body: 'OK'
  }
}
