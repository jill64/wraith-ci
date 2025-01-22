import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'
import { decrypt } from './decrypt.js'
import { assign } from './ghosts/assign.js'
import { Payload } from './types/Payload.js'
import { App } from 'octokit'
import { env } from 'node:process'

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  const { body } = event

  const txt = await decrypt(body)
  const json = JSON.parse(txt) as Payload

  const app = new App({
    appId: 420132,
    privateKey: env.GITHUB_APP_PRIVATEKEY_PKCS8!
  })

  const octokit = await app.getInstallationOctokit(json.installation_id)

  if (json.ghost === 'assign') {
    await assign(json, octokit)
  }

  return {
    statusCode: 200,
    body: 'OK'
  }
}
