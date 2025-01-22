import { auth } from '$lib/server/auth'
import { redirect } from '@sveltejs/kit'

export const GET = async (param) => {
  const url = await auth.callback(param)
  redirect(302, url)
}
