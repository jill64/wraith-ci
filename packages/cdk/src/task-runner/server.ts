import type { LambdaHandler, LambdaResponsePayload } from '@jill64/types-lambda'
import { decrypt } from './decrypt.js'
import { assign } from './ghosts/assign.js'
import { Payload } from './types/Payload.js'
import { App } from 'octokit'
import { env } from 'node:process'
import { bump } from './ghosts/bump/index.js'
import { release } from './ghosts/release/index.js'

export const handler: LambdaHandler = async (
  event
): Promise<LambdaResponsePayload> => {
  const { body } = event

  const txt = await decrypt(body)
  const payload = JSON.parse(txt) as Payload

  const app = new App({
    appId: 420132,
    privateKey: env.GITHUB_APP_PRIVATEKEY_PKCS8!
  })

  const octokit = await app.getInstallationOctokit(payload.installation_id)

  if (payload.ghost === 'assign') {
    await assign(payload, octokit)
  } else if (payload.ghost === 'bump') {
    await bump({ payload, octokit })
  } else if (payload.ghost === 'release') {
    await release({ payload, octokit })
  }

  return {
    statusCode: 200,
    body: 'OK'
  }
}
