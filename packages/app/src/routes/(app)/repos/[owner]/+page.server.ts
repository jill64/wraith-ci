import { redirect } from '@sveltejs/kit'

export const load = ({ params: { owner } }) => {
  redirect(302, `/repos/${owner}/1`)
}
