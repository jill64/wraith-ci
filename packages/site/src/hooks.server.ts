import { attach as lang_attach } from '$lib/i18n'
import { init } from '@jill64/sentry-sveltekit-cloudflare/server'
import { ogpAttach, onRender } from '@jill64/svelte-suite'
import { sequence } from '@sveltejs/kit/hooks'

const { onHandle, onError } = init(
  'https://a879bb63f90aea278cbc009cc0e5faca@o4505814639312896.ingest.sentry.io/4506177049067520'
)

export const handle = onHandle(sequence(lang_attach, onRender(), ogpAttach))
export const handleError = onError()
