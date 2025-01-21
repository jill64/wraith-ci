import { auth } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'

export const GET = (param) => {
  const url = auth.login(param)
  redirect(302, url)
}
