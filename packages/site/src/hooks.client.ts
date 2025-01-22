import { init } from '@jill64/sentry-sveltekit-cloudflare/client'
import { toast } from '@jill64/svelte-suite'

const onError = init(
  'https://29f631ada106b8c3db287db5ca6ecd85@o4505814639312896.ingest.us.sentry.io/4508681387900928'
)

export const handleError = onError((e) => {
  if (e.error instanceof Error) {
    toast.error(e.error.message)
  }
})
