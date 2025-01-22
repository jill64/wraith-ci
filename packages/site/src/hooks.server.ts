import { i } from '$lib/i18n'
import { init } from '@jill64/sentry-sveltekit-cloudflare/server'
import { ogpAttach, onRender } from '@jill64/svelte-suite'
import { sequence } from '@sveltejs/kit/hooks'

const { onHandle, onError } = init(
  'https://29f631ada106b8c3db287db5ca6ecd85@o4505814639312896.ingest.us.sentry.io/4508681387900928'
)

export const handle = onHandle(sequence(i.attach, onRender(), ogpAttach))
export const handleError = onError()
