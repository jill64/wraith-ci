import { applyGoogleTranslate } from '$shared/applyGoogleTranslate'
import { redirect } from '@sveltejs/kit'

export const load = () => {
  redirect(
    302,
    applyGoogleTranslate(
      'https://suwasystem.com/news?wg%5Bwgc-1725759068481_cate%5D=3',
      'en'
    )
  )
}
