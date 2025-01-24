import { ACCESS_TOKEN_PRIVATE_KEY } from '$env/static/private'
import { PUBLIC_BASE_URL } from '$env/static/public'
import { attempt } from '@jill64/attempt'
import { error, redirect, type RequestEvent } from '@sveltejs/kit'
import { decrypt } from '$shared/decrypt'
import { logout } from './logout'

export const auth = async (event: RequestEvent) => {
  const { cookies, url } = event

  const cookie = cookies.get('auth')

  if (cookie) {
    const accessToken = await decrypt(cookie, ACCESS_TOKEN_PRIVATE_KEY)

    const payload = await attempt(
      async () => {
        const userResponse = await fetch('https://api.github.com/user', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
            'User-Agent': 'Wraith CI'
          }
        })

        if (!userResponse.ok) {
          error(500, 'Failed to fetch user info from GitHub.')
        }

        const userData = await userResponse.json()

        return userData as App.Locals['github_user']
      },
      () => {
        logout(event)
        redirect(302, '/')
      }
    )

    return {
      payload,
      accessToken
    }
  }

  const { pathname, search, hash } = url

  redirect(
    302,
    `${PUBLIC_BASE_URL}/api/auth/login?returnUrl=${pathname}${search}${hash}`
  )
}
