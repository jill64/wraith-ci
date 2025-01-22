import crypto from 'node:crypto'
import process from 'node:process'

const base64ToBuffer = (base64: string): Uint8Array =>
  new Uint8Array(Buffer.from(base64, 'base64'))

export const decrypt = async (encrypted_text: string) => {
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    JSON.parse(process.env.API_BRIDGE_PRIVATE_KEY!),
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' }
    },
    true,
    ['decrypt']
  )

  const encryptedBytes = base64ToBuffer(encrypted_text)

  const decrypted_buffer = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    privateKey,
    encryptedBytes
  )

  const decrypted_text = new TextDecoder().decode(decrypted_buffer)

  return decrypted_text
}
