import {
  AUTH0_DOMAIN,
  AUTH0_M2M_CLIENT_ID,
  AUTH0_M2M_CLIENT_SECRET,
  GITHUB_APP_ID,
  GITHUB_APP_PRIVATE_KEY_PKCS8
} from '$env/static/private'
import { error } from '@sveltejs/kit'
import { App } from 'octokit'

const app = new App({
  appId: GITHUB_APP_ID,
  privateKey: GITHUB_APP_PRIVATE_KEY_PKCS8
})

interface Auth0TokenResponse {
  access_token: string
  token_type: string
  scope?: string
  expires_in?: number
}

interface Auth0User {
  user_id: string
  email?: string
  app_metadata?: Record<string, any>
  [key: string]: any
}

async function getManagementAPIToken(
  domain: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  // audience は Auth0 Management API に対するものを指定
  const audience = `https://${domain}/api/v2/`

  const url = `https://${domain}/oauth/token`
  const payload = {
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    audience
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(
      `Failed to get management token. Status: ${res.status}, Body: ${errorBody}`
    )
  }

  const data = (await res.json()) as Auth0TokenResponse
  return data.access_token
}

async function getUserAppMetadata(
  domain: string,
  mgmtToken: string,
  userId: string
): Promise<Record<string, any> | undefined> {
  // Management API のエンドポイント: GET /api/v2/users/{user_id}
  const url = `https://${domain}/api/v2/users/${encodeURIComponent(userId)}`

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${mgmtToken}`
    }
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(
      `Failed to get user data. Status: ${res.status}, Body: ${errorBody}`
    )
  }

  const user = (await res.json()) as Auth0User
  return user.app_metadata
}

export const genOctokit = async (oauth_user_id: string) => {
  const id = oauth_user_id.replace('github|', '') ?? ''

  const { data } = await app.octokit.request('GET /app/installations')

  const installation = data.find(
    (installation) => installation.account?.id === Number(id)
  )

  if (!installation) {
    error(500, 'Installation not found')
  }

  const kit = await app.getInstallationOctokit(installation.id)

  return {
    kit,
    installation
  }
}
