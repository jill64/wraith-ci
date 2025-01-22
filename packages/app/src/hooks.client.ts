import { init } from '@jill64/sentry-sveltekit-cloudflare/client'
import { toast } from '@jill64/svelte-suite'

const onError = init(
  'https://ea424676665cc9bbeea44d8c1ad7e7ed@o4505814639312896.ingest.us.sentry.io/4508682284105728'
)

export const handleError = onError((e) => {
  if (e.error instanceof Error) {
    toast.error(e.error.message)
  }
})
