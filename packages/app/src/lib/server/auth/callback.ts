import {
  GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_CLIENT_SECRET
} from '$env/static/private'
import { PUBLIC_BASE_URL } from '$env/static/public'
import { error, redirect, type RequestEvent } from '@sveltejs/kit'
import { encrypt } from '../encrypt'

export const callback = async ({ url, cookies }: RequestEvent) => {
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  let returnUrl = cookies.get('returnUrl') || '/'
  cookies.delete('returnUrl', { path: '/' })

  if (returnUrl.includes('/__data.json')) {
    returnUrl = returnUrl.replace('/__data.json', '')
  }

  const csrfState = cookies.get('csrfState')

  if (state !== csrfState || !code) {
    if (csrfState === undefined) {
      redirect(302, `${PUBLIC_BASE_URL}/api/auth/login`)
    }
    throw new Error('Invalid state')
  }

  cookies.delete('csrfState', { path: '/' })

  // Get the access token
  const tokenResponse = await fetch(
    'https://github.com/login/oauth/access_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: GITHUB_OAUTH_CLIENT_SECRET,
        code
      })
    }
  )

  const resJson = (await tokenResponse.json()) as {
    access_token: string
    token_type: 'bearer'
    scope: string
  }

  const accessToken = resJson.access_token

  if (!accessToken) {
    error(400, 'Failed to get access token.')
  }

  // Verify the access token
  const basicAuth = Buffer.from(
    `${GITHUB_OAUTH_CLIENT_ID}:${GITHUB_OAUTH_CLIENT_SECRET}`
  ).toString('base64')

  const checkResponse = await fetch(
    `https://api.github.com/applications/${GITHUB_OAUTH_CLIENT_ID}/token`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: accessToken
      })
    }
  )

  if (!checkResponse.ok) {
    error(401, 'Invalid access token (verification failed).')
  }

  const encryptedToken = await encrypt(accessToken)

  cookies.set('auth', encryptedToken, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000,
    path: '/'
  })

  // await this.setAuthCookie({
  //   cookies,
  //   payload: authUser
  // })

  redirect(302, returnUrl)
}
