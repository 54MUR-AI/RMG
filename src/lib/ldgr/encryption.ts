/**
 * Unified LDGR Encryption Module
 * 
 * Uses Web Crypto API exclusively:
 * - AES-256-GCM for encryption (authenticated encryption)
 * - PBKDF2 with 100,000 iterations for key derivation
 * - Random 12-byte IV per encryption operation
 * - User ID (immutable) for key derivation, NOT email
 * 
 * Binary format: [12-byte IV][encrypted data with GCM auth tag]
 * Text format: base64([12-byte IV][encrypted data with GCM auth tag])
 * 
 * Includes legacy CryptoJS decryption for migrating old encrypted data.
 */

// ============================================================
// Key Derivation
// ============================================================

/**
 * Derives an AES-256-GCM CryptoKey from a user ID and a purpose-specific salt.
 * Uses PBKDF2 with 100,000 iterations of SHA-256.
 * 
 * @param userId - The user's immutable Supabase UUID
 * @param purpose - A purpose string that acts as a domain separator (e.g. 'files', 'passwords', 'apikeys')
 */
export async function deriveKey(
  userId: string,
  purpose: string,
  operations: KeyUsage[] = ['encrypt', 'decrypt']
): Promise<CryptoKey> {
  const encoder = new TextEncoder()

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userId),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Salt = "ldgr:" + purpose + ":" + userId (unique per user per purpose)
  const salt = encoder.encode(`ldgr:${purpose}:${userId}`)

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    operations
  )
}

/**
 * Generates a deterministic encryption key string from user credentials.
 * Used as the "password" input for file encryption.
 * 
 * @param userId - User's immutable UUID
 * @param _userEmail - DEPRECATED, kept for API compatibility but ignored
 */
export function generateEncryptionKey(userId: string, _userEmail?: string): string {
  // Return the userId directly — the actual key derivation happens in deriveKey()
  // This function exists for backward compatibility with storage.ts call sites
  return userId
}

// ============================================================
// Text Encryption (for passwords, API keys, short strings)
// ============================================================

/**
 * Encrypts a string using AES-256-GCM with a key derived from the user's ID.
 * Returns base64-encoded [IV + ciphertext].
 */
export async function encryptText(
  plaintext: string,
  userId: string,
  purpose: string
): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(plaintext)
  const key = await deriveKey(userId, purpose, ['encrypt'])

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypts a base64-encoded [IV + ciphertext] string using AES-256-GCM.
 */
export async function decryptText(
  encryptedBase64: string,
  userId: string,
  purpose: string
): Promise<string> {
  const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))

  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)

  const key = await deriveKey(userId, purpose, ['decrypt'])

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  )

  return new TextDecoder().decode(decrypted)
}

// ============================================================
// File Encryption (for LDGR file storage)
// ============================================================

/**
 * Encrypts a File using AES-256-GCM.
 * Returns a Blob containing [12-byte IV][ciphertext with auth tag].
 */
export async function encryptFile(file: File | Blob, keyInput: string): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer()
  const key = await deriveKey(keyInput, 'files', ['encrypt'])

  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  )

  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)

  return new Blob([combined], { type: 'application/octet-stream' })
}

/**
 * Decrypts a Blob containing [12-byte IV][ciphertext with auth tag].
 * Returns a Blob with the specified MIME type.
 */
export async function decryptFile(
  encryptedBlob: Blob,
  keyInput: string,
  originalType: string
): Promise<Blob> {
  const arrayBuffer = await encryptedBlob.arrayBuffer()
  const combined = new Uint8Array(arrayBuffer)

  const iv = combined.slice(0, 12)
  const encrypted = combined.slice(12)

  const key = await deriveKey(keyInput, 'files', ['decrypt'])

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  )

  return new Blob([decrypted], { type: originalType })
}

// ============================================================
// Legacy CryptoJS Decryption (for migrating old data)
// ============================================================

/**
 * Attempts to decrypt data that was encrypted with the old CryptoJS system.
 * Used during migration: read with legacy, re-encrypt with new system.
 * 
 * Falls back gracefully — returns null if decryption fails.
 */
export async function legacyDecryptFile(
  encryptedBlob: Blob,
  userId: string,
  userEmail: string,
  originalType: string
): Promise<Blob | null> {
  try {
    const CryptoJS = (await import('crypto-js')).default
    const legacyKey = CryptoJS.SHA256(userId + userEmail).toString()

    const encryptedText = await encryptedBlob.text()
    const decrypted = CryptoJS.AES.decrypt(encryptedText, legacyKey)

    const sigBytes = decrypted.sigBytes
    const words = decrypted.words
    const u8 = new Uint8Array(sigBytes)
    for (let i = 0; i < sigBytes; i++) {
      u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
    }

    return new Blob([u8], { type: originalType })
  } catch {
    return null
  }
}

/**
 * Attempts to decrypt text that was encrypted with the old email-based Web Crypto system.
 * Used for migrating passwords and API keys that used email as the key material.
 * 
 * @param encryptedBase64 - The base64-encoded encrypted data
 * @param userEmail - The user's email (old key material)
 * @param salt - The salt used in the old system (email for API keys, 'ldgr-passwords-salt' for passwords)
 */
export async function legacyDecryptText(
  encryptedBase64: string,
  userEmail: string,
  salt: string
): Promise<string | null> {
  try {
    const encoder = new TextEncoder()
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0))

    const iv = combined.slice(0, 12)
    const encrypted = combined.slice(12)

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(userEmail),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    )

    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    )

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    )

    return new TextDecoder().decode(decrypted)
  } catch {
    return null
  }
}
