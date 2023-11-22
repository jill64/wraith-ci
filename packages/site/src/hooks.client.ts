import { clientInit } from '@jill64/sentry-sveltekit-cloudflare'
import { toast } from '@jill64/svelte-toast'
import { get } from 'svelte/store'

const onError = clientInit(
  'https://a879bb63f90aea278cbc009cc0e5faca@o4505814639312896.ingest.sentry.io/4506177049067520'
)

export const handleError = onError((e) => {
  if (e.error instanceof Error) {
    get(toast).error(e.error.message)
  }
})
