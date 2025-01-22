import { auth } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'

export const GET = (param) => {
  const url = auth.logout(param)
  redirect(302, url)
}
