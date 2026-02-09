import { supabase } from '../supabase'

export interface CryptoWallet {
  id: string
  user_id: string
  wallet_name: string
  blockchain: string
  address: string
  encrypted_seed_phrase: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CryptoWalletInput {
  wallet_name: string
  blockchain: string
  address: string
  seed_phrase: string
  notes?: string
}

export interface WalletBalance {
  balance: string
  usd_value: string
  last_updated: string
}

// Encrypt seed phrase using Web Crypto API
async function encryptSeedPhrase(seedPhrase: string, userEmail: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(seedPhrase)
  
  // Derive key from user email
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userEmail),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ldgr-crypto-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedData), iv.length)
  
  // Encode to base64
  return btoa(String.fromCharCode(...combined))
}

// Decrypt seed phrase
export async function decryptSeedPhrase(encryptedSeedPhrase: string, userEmail: string): Promise<string> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedSeedPhrase), c => c.charCodeAt(0))
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12)
  const encryptedData = combined.slice(12)
  
  // Derive key from user email
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userEmail),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ldgr-crypto-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  )
  
  return decoder.decode(decryptedData)
}

// Get all wallets for a user
export async function getUserWallets(userId: string): Promise<CryptoWallet[]> {
  const { data, error } = await supabase
    .from('crypto_wallets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get wallets by blockchain
export async function getWalletsByBlockchain(userId: string, blockchain: string): Promise<CryptoWallet[]> {
  const { data, error } = await supabase
    .from('crypto_wallets')
    .select('*')
    .eq('user_id', userId)
    .eq('blockchain', blockchain)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Add a new wallet
export async function addWallet(
  userId: string,
  userEmail: string,
  input: CryptoWalletInput
): Promise<CryptoWallet> {
  // Encrypt the seed phrase
  const encryptedSeedPhrase = await encryptSeedPhrase(input.seed_phrase, userEmail)
  
  const { data, error } = await supabase
    .from('crypto_wallets')
    .insert({
      user_id: userId,
      wallet_name: input.wallet_name,
      blockchain: input.blockchain,
      address: input.address,
      encrypted_seed_phrase: encryptedSeedPhrase,
      notes: input.notes || null
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Update a wallet
export async function updateWallet(
  walletId: string,
  userEmail: string,
  updates: Partial<CryptoWalletInput>
): Promise<CryptoWallet> {
  const updateData: any = {}
  
  if (updates.wallet_name) updateData.wallet_name = updates.wallet_name
  if (updates.blockchain) updateData.blockchain = updates.blockchain
  if (updates.address) updateData.address = updates.address
  if (updates.notes !== undefined) updateData.notes = updates.notes || null
  
  // Only encrypt if seed phrase is being updated
  if (updates.seed_phrase) {
    updateData.encrypted_seed_phrase = await encryptSeedPhrase(updates.seed_phrase, userEmail)
  }
  
  const { data, error } = await supabase
    .from('crypto_wallets')
    .update(updateData)
    .eq('id', walletId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete a wallet
export async function deleteWallet(walletId: string): Promise<void> {
  const { error } = await supabase
    .from('crypto_wallets')
    .delete()
    .eq('id', walletId)
  
  if (error) throw error
}

// Fetch wallet balance from blockchain API
export async function fetchWalletBalance(
  address: string,
  blockchain: string
): Promise<WalletBalance | null> {
  try {
    // TODO: Implement actual blockchain API calls
    // Examples:
    // - Ethereum: Etherscan API, Alchemy, Infura
    // - Bitcoin: Blockchain.com API, Blockchair
    // - Solana: Solana RPC, Helius
    // - Polygon: PolygonScan API
    
    // Placeholder implementation
    console.log(`Fetching balance for ${blockchain} address: ${address}`)
    
    // Return mock data for now
    return {
      balance: '0.00',
      usd_value: '$0.00',
      last_updated: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error fetching wallet balance:', error)
    return null
  }
}
