import crypto from 'node:crypto'

const base64ToBuffer = (base64: string): Uint8Array =>
  new Uint8Array(Buffer.from(base64, 'base64'))

async function decryptAesKeyWithRsa(
  privateKey: CryptoKey,
  encryptedSessionKey: Uint8Array
): Promise<CryptoKey> {
  // RSA-OAEP を用いて AESキーを復号
  const rawAesKey = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP'
    },
    privateKey,
    encryptedSessionKey
  )

  // 復号したバイナリデータから AES-CTR キーとして再インポート
  return await crypto.subtle.importKey(
    'raw',
    rawAesKey,
    {
      name: 'AES-CTR',
      length: 256
    },
    true, // 再エクスポート可能 (必要に応じて false でもOK)
    ['encrypt', 'decrypt']
  )
}
async function decryptWithAes(
  key: CryptoKey,
  encryptedData: Uint8Array,
  iv: Uint8Array
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-CTR',
      counter: iv,
      length: 64
    },
    key,
    encryptedData
  )
  const decoder = new TextDecoder()
  return decoder.decode(decrypted)
}
export const decrypt = async (encrypted_text: string, key: string) => {
  const { encryptedData, iv, encryptedSessionKey } = JSON.parse(
    encrypted_text
  ) as {
    encryptedData: string
    iv: string
    encryptedSessionKey: string
  }

  const encryptedDataBuffer = base64ToBuffer(encryptedData)
  const ivBuffer = base64ToBuffer(iv)
  const encryptedSessionKeyBuffer = base64ToBuffer(encryptedSessionKey)

  const privateKey = await crypto.subtle.importKey(
    'jwk',
    JSON.parse(key),
    {
      name: 'RSA-OAEP',
      hash: { name: 'SHA-256' }
    },
    true,
    ['decrypt']
  )

  const decryptedAesKey = await decryptAesKeyWithRsa(
    privateKey,
    encryptedSessionKeyBuffer
  )

  const decryptedText = await decryptWithAes(
    decryptedAesKey,
    encryptedDataBuffer,
    ivBuffer
  )

  return decryptedText
}
