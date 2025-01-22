import { dev } from '$app/environment'
import { error, type Handle } from '@sveltejs/kit'

const allowedOrigins = new Set([
  'https://dev.api-wraithci.pages.dev',
  'https://api.wraithci.dev'
])

export const csrfHandle: Handle = async ({ resolve, event }) => {
  if (dev) {
    return resolve(event)
  }

  const {
    request: { method, headers },
    url: { origin }
  } = event

  if (method === 'GET') {
    return resolve(event)
  }

  if (headers.get('origin') !== origin && !allowedOrigins.has(origin)) {
    error(403, 'CSRF detected')
  }

  return resolve(event)
}
