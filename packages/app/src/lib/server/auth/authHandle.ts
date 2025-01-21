import { error, type Handle, redirect } from '@sveltejs/kit'
import { auth } from './index'
import { boolean, optional, scanner, string } from 'typescanner'

const isOAuthUser = scanner({
  sub: string,
  nickname: string,
  email: optional(string),
  email_verified: optional(boolean),
  picture: optional(string)
})

export const authHandle: Handle = async ({ resolve, event }) => {
  if (event.url.pathname.startsWith('/api/auth')) {
    return resolve(event)
  }

  const result = await auth.auth(event)

  if (typeof result === 'string') {
    redirect(302, result)
  }

  if (!isOAuthUser(result)) {
    error(500, 'Invalid auth result')
  }

  if (!result.email) {
    auth.logout(event)
    await auth.delete()
    redirect(302, 'https://wraithci.dev/required-email')
  }

  event.locals.oauth_user = {
    id: result.sub,
    name: result.nickname,
    email: result.email,
    email_verified: result.email_verified,
    picture: result.picture
  }

  return resolve(event)
}
