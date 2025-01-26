import { applyGoogleTranslate } from '$shared/applyGoogleTranslate'
import { redirect } from '@sveltejs/kit'

export const load = () => {
  redirect(302, applyGoogleTranslate('https://suwasystem.com/contact', 'en'))
}
