import { GITHUB_OAUTH_CLIENT_ID } from '$env/static/private'
import { PUBLIC_BASE_URL } from '$env/static/public'
import { redirect, type RequestEvent } from '@sveltejs/kit'
import crypto from 'node:crypto'

export const login = ({ cookies, url }: RequestEvent) => {
  const csrfState = crypto.randomBytes(16).toString('hex')

  cookies.set('csrfState', csrfState, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000,
    path: '/'
  })

  const returnUrl = url.searchParams.get('returnUrl') || '/'

  cookies.set('returnUrl', returnUrl, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000,
    path: '/'
  })

  const scope = 'read:user user:email public_repo delete_repo read:org'

  redirect(
    302,
    `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&redirect_uri=${PUBLIC_BASE_URL}/api/auth/callback&scope=${scope}&state=${csrfState}`
  )
}
