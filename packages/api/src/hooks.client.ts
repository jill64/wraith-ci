import { init } from '@jill64/sentry-sveltekit-cloudflare/client'

const onError = init(
  'https://a0d1d77b30e954fc575fae2b0759d2c3@o4505814639312896.ingest.us.sentry.io/4508684558008320'
)

export const handleError = onError()
