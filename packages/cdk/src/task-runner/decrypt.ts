import { env } from 'node:process'

export const decrypt = async (encrypted_text: string) => {
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    JSON.parse(env.API_BRIDGE_PRIVATE_KEY!),
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' }
    },
    true,
    ['decrypt']
  )

  const encrypted_buffer = new TextEncoder().encode(encrypted_text)

  const decrypted_buffer = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    privateKey,
    encrypted_buffer
  )

  const decrypted_text = new TextDecoder().decode(decrypted_buffer)

  return decrypted_text
}
