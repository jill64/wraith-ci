import process from 'node:process'
import crypto from 'node:crypto'

// ヘルパー関数
function base64ToBuffer(base64: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64, 'base64'))
}

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

  // encrypted_text は Base64 として受け取る
  const encryptedBytes = base64ToBuffer(encrypted_text)

  console.log('Decrypting buffer...')

  const decrypted_buffer = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    privateKey,
    encryptedBytes
  )

  console.log('Converting decrypted buffer to text...')

  const decrypted_text = new TextDecoder().decode(decrypted_buffer)

  console.log('Decrypted text:', decrypted_text)

  return decrypted_text
}
