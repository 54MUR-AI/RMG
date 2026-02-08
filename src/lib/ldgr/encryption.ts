import CryptoJS from 'crypto-js'

/**
 * Encrypts a file using AES-256 encryption
 * @param file - The file to encrypt
 * @param password - The encryption password (derived from user credentials)
 * @returns Encrypted file as Blob
 */
export async function encryptFile(file: File, password: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const fileData = e.target?.result as ArrayBuffer
        const wordArray = CryptoJS.lib.WordArray.create(fileData)
        const encrypted = CryptoJS.AES.encrypt(wordArray, password).toString()
        const blob = new Blob([encrypted], { type: 'application/octet-stream' })
        resolve(blob)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(reader.error)
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Decrypts an encrypted file
 * @param encryptedBlob - The encrypted file blob
 * @param password - The decryption password
 * @param originalType - The original file MIME type
 * @returns Decrypted file as Blob
 */
export async function decryptFile(
  encryptedBlob: Blob,
  password: string,
  originalType: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const encryptedData = e.target?.result as string
        const decrypted = CryptoJS.AES.decrypt(encryptedData, password)
        const typedArray = convertWordArrayToUint8Array(decrypted)
        const blob = new Blob([typedArray], { type: originalType })
        resolve(blob)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(reader.error)
    reader.readAsText(encryptedBlob)
  })
}

/**
 * Converts CryptoJS WordArray to Uint8Array
 */
function convertWordArrayToUint8Array(wordArray: CryptoJS.lib.WordArray): Uint8Array {
  const words = wordArray.words
  const sigBytes = wordArray.sigBytes
  const u8 = new Uint8Array(sigBytes)
  
  for (let i = 0; i < sigBytes; i++) {
    u8[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff
  }
  
  return u8
}

/**
 * Generates an encryption key from user credentials
 * @param userId - User's unique ID
 * @param userEmail - User's email
 * @returns Encryption key
 */
export function generateEncryptionKey(userId: string, userEmail: string): string {
  return CryptoJS.SHA256(userId + userEmail).toString()
}
