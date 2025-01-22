import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'
import { decrypt } from './decrypt.js'

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  console.log(event)

  const { body } = event

  const text = await decrypt(body)

  console.log({ text })

  return {
    statusCode: 200,
    body: text
  }
}
