import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  console.log(event)
  return {
    statusCode: 200,
    body: JSON.stringify(event)
  }
}
