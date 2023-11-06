import { init } from '@jill64/svelte-i18n'

export const { match, attach, translate } = init({
  locales: ['en', 'ja'],
  slug: '[locale=locale]',
  defaultLocale: 'en'
})
