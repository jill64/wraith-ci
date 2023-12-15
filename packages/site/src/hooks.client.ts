import { init } from '@jill64/sentry-sveltekit-cloudflare/client'

const onError = init(
  'https://a879bb63f90aea278cbc009cc0e5faca@o4505814639312896.ingest.sentry.io/4506177049067520'
)

export const handleError = onError()
