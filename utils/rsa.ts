/** 检查 WebCrypto 可用性 */
function requireSubtle(): SubtleCrypto {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) {
      throw new Error('WebCrypto 不可用：需要 HTTPS 或 localhost 环境');
    }
    return subtle;
  }
  
  // ============ 密钥生成 ============
  
  export interface RSAKeyPair {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  }
  
  /**
   * 生成 RSA-OAEP 密钥对
   * @param modulusLength 密钥长度（2048/4096）
   */
  export async function generateRSAKeyPair(
    modulusLength: 2048 | 4096 = 2048,
  ): Promise<RSAKeyPair> {
    const subtle = requireSubtle();
    const keyPair = await subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength,
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: { name: 'SHA-256' },
      },
      true, // 可导出
      ['encrypt', 'decrypt'],
    );
    return keyPair as RSAKeyPair;
  }
  
  // ============ PEM 与 ArrayBuffer 互转 ============
  
  function arrayBufferToBase64(buf: ArrayBuffer): string {
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
  
  function base64ToArrayBuffer(b64: string): ArrayBuffer {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
  
  /**
   * 将 ArrayBuffer 转为 PEM 字符串
   * @param buf DER 格式的密钥
   * @param type 'PUBLIC KEY' | 'PRIVATE KEY'
   */
  function arrayBufferToPem(buf: ArrayBuffer, type: 'PUBLIC KEY' | 'PRIVATE KEY'): string {
    const b64 = arrayBufferToBase64(buf);
    const lines = b64.match(/.{1,64}/g) || [b64];
    return `-----BEGIN ${type}-----\n${lines.join('\n')}\n-----END ${type}-----`;
  }
  
  /**
   * 将 PEM 转为 ArrayBuffer（DER）
   */
  function pemToArrayBuffer(pem: string): ArrayBuffer {
    // 去掉 PEM 格式
    const b64 = pem
      .replace(/-----BEGIN.*?-----/g, '')
      .replace(/-----END.*?-----/g, '')
      .replace(/\s+/g, '');

    // 后端已去掉PEM
    // const b64 = pem
    return base64ToArrayBuffer(b64);
  }
  
  // ============ 导出密钥为 PEM ============
  
  export async function exportPublicKeyToPem(key: CryptoKey): Promise<string> {
    const subtle = requireSubtle();
    const buf = await subtle.exportKey('spki', key);
    return arrayBufferToPem(buf, 'PUBLIC KEY');
  }
  
  export async function exportPrivateKeyToPem(key: CryptoKey): Promise<string> {
    const subtle = requireSubtle();
    const buf = await subtle.exportKey('pkcs8', key);
    return arrayBufferToPem(buf, 'PRIVATE KEY');
  }
  
  // ============ 从 PEM 导入密钥 ============
  
  /**
   * 从 PEM 导入公钥（SPKI 格式：-----BEGIN PUBLIC KEY-----）
   */
  export async function importPublicKeyFromPem(pem: string): Promise<CryptoKey> {
    const subtle = requireSubtle();
    const der = pemToArrayBuffer(pem);
    // const der = base64ToArrayBuffer(pem)
    return subtle.importKey(
      'spki',
      der,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true, // 可导出
      ['encrypt'],
    );
  }
  
  /**
   * 从 PEM 导入私钥（PKCS#8 格式：-----BEGIN PRIVATE KEY-----）
   */
  export async function importPrivateKeyFromPem(pem: string): Promise<CryptoKey> {
    const subtle = requireSubtle();
    const der = pemToArrayBuffer(pem);
    return subtle.importKey(
      'pkcs8',
      der,
      { name: 'RSA-OAEP', hash: { name: 'SHA-256' } },
      true, // 可导出
      ['decrypt'],
    );
  }
  
  // ============ 加密与解密 ============
  
  /**
   * RSA-OAEP 加密（用公钥）
   * @param plaintext 明文字符串
   * @param publicKey 公钥 CryptoKey 或 PEM 字符串
   * @returns base64 密文
   */
  export async function rsaEncrypt(
    plaintext: string,
    publicKey: CryptoKey | string,
  ): Promise<string> {
    const subtle = requireSubtle();
    const key = typeof publicKey === 'string' 
      ? await importPublicKeyFromPem(publicKey) 
      : publicKey;
    
    const data = new TextEncoder().encode(plaintext);
    const encrypted = await subtle.encrypt(
      { name: 'RSA-OAEP' }, 
      key, 
      data,
    );
    return arrayBufferToBase64(encrypted);
  }
  
  /**
   * RSA-OAEP 解密（用私钥）
   * @param ciphertext base64 密文
   * @param privateKey 私钥 CryptoKey 或 PEM 字符串
   * @returns 明文字符串
   */
  export async function rsaDecrypt(
    ciphertext: string,
    privateKey: CryptoKey | string,
  ): Promise<string> {
    const subtle = requireSubtle();
    const key = typeof privateKey === 'string' 
      ? await importPrivateKeyFromPem(privateKey) 
      : privateKey;
    
    const data = base64ToArrayBuffer(ciphertext);
    const decrypted = await subtle.decrypt(
      { name: 'RSA-OAEP' }, 
      key, 
      data,
    );
    return new TextDecoder().decode(decrypted);
  }
  
  // ============ localStorage 持久化（仅演示，生产环境慎用） ============
  
  export async function saveKeyPairToStorage(
    keyPair: RSAKeyPair,
    storageKey = 'rsa_keypair',
  ): Promise<void> {
    const pubPem = await exportPublicKeyToPem(keyPair.publicKey);
    const privPem = await exportPrivateKeyToPem(keyPair.privateKey);
    localStorage.setItem(
      storageKey,
      JSON.stringify({ publicKey: pubPem, privateKey: privPem }),
    );
  }
  
  export async function loadKeyPairFromStorage(
    storageKey = 'rsa_keypair',
  ): Promise<RSAKeyPair | null> {
    const json = localStorage.getItem(storageKey);
    if (!json) return null;
    const { publicKey, privateKey } = JSON.parse(json);
    return {
      publicKey: await importPublicKeyFromPem(publicKey),
      privateKey: await importPrivateKeyFromPem(privateKey),
    };
  }