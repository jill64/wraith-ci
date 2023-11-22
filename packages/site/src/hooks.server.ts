import { attach as lang_attach } from '$lib/i18n'
import { serverInit } from '@jill64/sentry-sveltekit-cloudflare'
import { onRender } from '@jill64/svelte-dark-theme'
import { attach as ogp_attach } from '@jill64/svelte-ogp'
import { sequence } from '@sveltejs/kit/hooks'

const { onHandle, onError } = serverInit(
  'https://a879bb63f90aea278cbc009cc0e5faca@o4505814639312896.ingest.sentry.io/4506177049067520'
)

export const handle = onHandle(sequence(lang_attach, onRender(), ogp_attach))
export const handleError = onError()
