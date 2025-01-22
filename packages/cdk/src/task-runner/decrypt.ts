import process from 'node:process'
import crypto from 'node:crypto'

export const decrypt = async (encrypted_text: string) => {

  console.log('Imported private key...')

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

  console.log('Converting encrypted text to buffer...')

  const encrypted_buffer = new TextEncoder().encode(encrypted_text)

  console.log('Decrypting buffer...')

  const decrypted_buffer = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    privateKey,
    encrypted_buffer
  )

  console.log('Converting decrypted buffer to text...')

  const decrypted_text = new TextDecoder().decode(decrypted_buffer)

  console.log('Decrypted text:', decrypted_text)

  return decrypted_text
}
