import { logout } from '$lib/server/auth/logout.js'
import { redirect } from '@sveltejs/kit'

export const GET = (param) => {
  logout(param)
  redirect(302, 'https://github.com/logout')
}
