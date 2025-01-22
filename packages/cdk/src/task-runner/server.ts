import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'
import { decrypt } from './decrypt.js'

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  const { body } = event

  await decrypt(body)

  return {
    statusCode: 200,
    body: 'OK'
  }
}
