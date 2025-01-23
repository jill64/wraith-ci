import {
  GITHUB_APP_ID,
  GITHUB_APP_PRIVATE_KEY_PKCS8
} from '$env/static/private'
import { type Handle } from '@sveltejs/kit'
import { App } from 'octokit'

const app = new App({
  appId: GITHUB_APP_ID,
  privateKey: GITHUB_APP_PRIVATE_KEY_PKCS8
})

export const octokitHandle: Handle = async ({ event, resolve }) => {
  const id = event.locals.oauth_user.id.replace('github|', '')
  const { data } = await app.octokit.request('GET /app/installations')
  const dataIndex = data.map((installation) => installation.account?.id)

  const installationIndex = dataIndex.findIndex(
    (installation_id) => installation_id === Number(id)
  )

  const installation = data[installationIndex]

  const kit = await app.getInstallationOctokit(installation?.id)

  event.locals.kit = kit

  return resolve(event)
}
