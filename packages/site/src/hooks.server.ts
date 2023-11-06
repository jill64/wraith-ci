import { PUBLIC_SENTRY_DSN } from '$env/static/public'
import { attach as lang_attach } from '$lib/i18n'
import { serverInit } from '@jill64/sentry-sveltekit-cloudflare'
import { onRender } from '@jill64/svelte-dark-theme'
import { attach as ogp_attach } from '@jill64/svelte-ogp'
import { sequence } from '@sveltejs/kit/hooks'

const { onHandle, onError } = serverInit(PUBLIC_SENTRY_DSN)

export const handle = onHandle(sequence(lang_attach, onRender(), ogp_attach))
export const handleError = onError()
