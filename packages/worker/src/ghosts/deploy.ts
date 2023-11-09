import { Ghost } from '@/worker/types/Ghost.js'

export const deploy: Ghost = async ({ installation }) => {
  const result = await installation.getFile('wrangler.toml')

  if (!result?.data) {
    return {
      status: 'skipped',
      detail: 'wrangler.toml not found'
    }
  }

  return 'bridged'
}
