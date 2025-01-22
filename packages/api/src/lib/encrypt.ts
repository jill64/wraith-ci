import { API_BRIDGE_PUBLIC_KEY } from "$env/static/private"
import crypto from 'node:crypto'

export const encrypt = async (plainText: string) => {
  const plainBuffer = new TextEncoder().encode(plainText)

  const publicKey = await crypto.subtle.importKey(
    'jwk',
    JSON.parse(API_BRIDGE_PUBLIC_KEY),
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' }
    },
    true,
    ['encrypt']
  )

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    plainBuffer
  )

  const encryptedText = new TextDecoder().decode(encryptedBuffer)

  return encryptedText
}