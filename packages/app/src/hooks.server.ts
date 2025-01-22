import { i } from '$lib/i18n'
import { authHandle } from '$lib/server/auth/authHandle'
import { dbHandle } from '$lib/server/db/dbHandle'
import { init } from '@jill64/sentry-sveltekit-cloudflare/server'
import { ogpAttach, onRender } from '@jill64/svelte-suite'
import { sequence } from '@sveltejs/kit/hooks'

const { onHandle, onError } = init(
  'https://ea424676665cc9bbeea44d8c1ad7e7ed@o4505814639312896.ingest.us.sentry.io/4508682284105728'
)

export const handle = onHandle(
  sequence(i.attach, onRender(), ogpAttach, authHandle, dbHandle)
)

export const handleError = onError()
