import { API_BRIDGE_PUBLIC_KEY } from '$env/static/private'
import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'

// ヘルパー関数
function bufferToBase64(buffer: Uint8Array) {
  return Buffer.from(buffer).toString('base64')
}

async function encryptWithAes(
  key: CryptoKey,
  plainText: string
): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  // AES-CTR ではカウンタとして 96 ビット (12バイト) の IV を推奨
  const iv = crypto.getRandomValues(new Uint8Array(16))

  // テキストを UTF-8 エンコード
  const encoder = new TextEncoder()
  const data = encoder.encode(plainText)

  // AES-CTR で暗号化
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-CTR',
      counter: iv,
      length: 64 // CTRモードでブロックあたり何ビットカウントするか
    },
    key,
    data
  )

  return { encryptedData, iv }
}

async function encryptAesKeyWithRsa(
  publicKey: CryptoKey,
  aesKey: CryptoKey
): Promise<ArrayBuffer> {
  // AESキー（rawバイナリ）を取り出す
  const rawAesKey = await crypto.subtle.exportKey('raw', aesKey)

  // RSA-OAEP を用いて AESキーを暗号化
  return await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP'
    },
    publicKey,
    rawAesKey
  )
}

export const encrypt = async (plainText: string) => {
  const [publicKey, aesKey] = await Promise.all([
    crypto.subtle.importKey(
      'jwk',
      JSON.parse(API_BRIDGE_PUBLIC_KEY),
      {
        name: 'RSA-OAEP',
        hash: { name: 'SHA-256' }
      },
      true,
      ['encrypt']
    ),
    crypto.subtle.generateKey(
      {
        name: 'AES-CTR',
        length: 256 // 256-bit key
      },
      true, // エクスポート可能とする（RSAで鍵を暗号化するため）
      ['encrypt', 'decrypt']
    )
  ])

  const { encryptedData, iv } = await encryptWithAes(aesKey, plainText)
  const encryptedSessionKey = await encryptAesKeyWithRsa(publicKey, aesKey)

  return {
    encryptedData: bufferToBase64(new Uint8Array(encryptedData)),
    iv: bufferToBase64(iv),
    encryptedSessionKey: bufferToBase64(new Uint8Array(encryptedSessionKey))
  }
}
