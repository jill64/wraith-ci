import { API_BRIDGE_PUBLIC_KEY } from '$env/static/private'
import crypto from 'node:crypto'
import { Buffer } from 'node:buffer'

// ヘルパー関数
function bufferToBase64(buffer: Uint8Array) {
  return Buffer.from(buffer).toString('base64')
}

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

  // 暗号バイナリを Uint8Array に変換
  const encryptedBytes = new Uint8Array(encryptedBuffer)

  // Base64形式の文字列に変換
  const encryptedBase64 = bufferToBase64(encryptedBytes)

  return encryptedBase64
}
