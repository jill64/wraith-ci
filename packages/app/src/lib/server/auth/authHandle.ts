import { Octokit } from '@octokit/rest'
import { type Handle, redirect } from '@sveltejs/kit'
import { auth } from './auth'
import { logout } from './logout'

export const authHandle: Handle = async ({ resolve, event }) => {
  if (event.url.pathname.startsWith('/api/auth')) {
    return resolve(event)
  }

  const { payload, accessToken } = await auth(event)

  if (!payload.email) {
    logout(event)
    redirect(302, 'https://wraithci.dev/required-email')
  }

  event.locals.github_user = payload

  const kit = new Octokit({
    auth: accessToken
  })

  event.locals.kit = kit

  return resolve(event)
}
