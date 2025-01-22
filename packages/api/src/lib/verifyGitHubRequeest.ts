import { GITHUB_APP_WEBHOOK_SECRET } from '$env/static/private'
import { error } from '@sveltejs/kit'
import crypto from 'node:crypto'

export const verifyGitHubRequest = async (request: Request) => {
  const { headers, method } = request

  if (method === 'GET' || method === 'HEAD') {
    return new Response(null, {
      status: 204
    })
  }

  if (method !== 'POST') {
    error(405, 'Method Not Allowed')
  }

  const body = await request.text()

  const signature = crypto
    .createHmac('sha256', GITHUB_APP_WEBHOOK_SECRET)
    .update(body)
    .digest('hex')

  const headerSignature = headers.get('X-Hub-Signature-256')

  if (!headerSignature) {
    error(401, 'Unauthorized')
  }

  const signature_array = new TextEncoder().encode(`sha256=${signature}`)
  const header_sig_array = new TextEncoder().encode(headerSignature)

  if (!crypto.timingSafeEqual(signature_array, header_sig_array)) {
    error(403, 'Forbidden')
  }

  return body
}
