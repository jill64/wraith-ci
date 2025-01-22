const keyPair = await crypto.subtle.generateKey(
  {
    name: 'RSA-OAEP',
    // RSA 鍵長(ビット長)を指定（例: 2048）
    modulusLength: 2048,
    // 公開指数 e = 65537
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    // OAEP で使うハッシュ (SHA-256 など)
    hash: { name: 'SHA-256' }
  },
  true, // extractable: true => 鍵をエクスポート可能か
  ['encrypt', 'decrypt'] // 公開鍵で encrypt、秘密鍵で decrypt を許可
)

const [jwk_public_key,jwk_private_key] = await Promise.all([
  crypto.subtle.exportKey('jwk', keyPair.publicKey),
  crypto.subtle.exportKey('jwk', keyPair.privateKey)
])

console.log({
  private_key: JSON.stringify(jwk_private_key),
  public_key: JSON.stringify(jwk_public_key)
})
