import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'
import { decrypt } from './decrypt'

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  console.log(event)

  const {
    request: { body }
  } = event

  const text = await decrypt(body)

  return {
    statusCode: 200,
    body: text
  }
}
