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
  // Encrypt the seed phrase only if provided
  const encryptedSeedPhrase = input.seed_phrase 
    ? await encryptSeedPhrase(input.seed_phrase, userEmail)
    : null
  
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

// Mapping of blockchain to CoinGecko coin ID
const COINGECKO_IDS: Record<string, string> = {
  ethereum: 'ethereum',
  bitcoin: 'bitcoin',
  solana: 'solana',
  polygon: 'matic-network',
  binance: 'binancecoin',
  avalanche: 'avalanche-2',
  cardano: 'cardano',
  ripple: 'ripple'
}

// Fetch crypto price in USD from CoinGecko (free, no API key needed)
async function fetchCryptoPrice(blockchain: string): Promise<number> {
  try {
    const coinId = COINGECKO_IDS[blockchain]
    if (!coinId) return 0
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
    )
    const data = await response.json()
    
    if (data[coinId] && data[coinId].usd) {
      return data[coinId].usd
    }
    return 0
  } catch (error) {
    console.error(`Error fetching ${blockchain} price:`, error)
    return 0
  }
}

// Fetch wallet balance from blockchain API
export async function fetchWalletBalance(
  address: string,
  blockchain: string
): Promise<WalletBalance | null> {
  try {
    let balance = '0.00'
    
    switch (blockchain) {
      case 'ethereum':
        balance = await fetchEthereumBalance(address)
        break
      case 'bitcoin':
        balance = await fetchBitcoinBalance(address)
        break
      case 'solana':
        balance = await fetchSolanaBalance(address)
        break
      case 'polygon':
        balance = await fetchPolygonBalance(address)
        break
      case 'binance':
        balance = await fetchBinanceBalance(address)
        break
      case 'avalanche':
        balance = await fetchAvalancheBalance(address)
        break
      case 'cardano':
        balance = await fetchCardanoBalance(address)
        break
      case 'ripple':
        balance = await fetchRippleBalance(address)
        break
      case 'cronos':
        balance = await fetchCronosBalance(address)
        break
      default:
        console.warn(`Blockchain ${blockchain} not supported for balance fetching`)
        return null
    }
    
    // Get USD value
    const price = await fetchCryptoPrice(blockchain)
    const balanceNum = parseFloat(balance)
    const usdAmount = balanceNum * price
    const usdValue = usdAmount > 0 ? `$${usdAmount.toFixed(2)}` : '$0.00'
    
    return {
      balance,
      usd_value: usdValue,
      last_updated: new Date().toISOString()
    }
  } catch (error) {
    console.error(`Error fetching ${blockchain} balance:`, error)
    return null
  }
}

// Ethereum balance via Etherscan API (free tier)
async function fetchEthereumBalance(address: string): Promise<string> {
  try {
    // Using Etherscan free API (no key needed for basic queries)
    const response = await fetch(
      `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.result) {
      // Convert from Wei to ETH
      const balanceInEth = (parseInt(data.result) / 1e18).toFixed(4)
      return balanceInEth
    }
    return '0.00'
  } catch (error) {
    console.error('Ethereum balance fetch error:', error)
    return '0.00'
  }
}

// Bitcoin balance via Blockchain.com API (free)
async function fetchBitcoinBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://blockchain.info/q/addressbalance/${address}`
    )
    const satoshis = await response.text()
    
    // Convert from Satoshis to BTC
    const balanceInBtc = (parseInt(satoshis) / 1e8).toFixed(8)
    return balanceInBtc
  } catch (error) {
    console.error('Bitcoin balance fetch error:', error)
    return '0.00'
  }
}

// Solana balance via public RPC
async function fetchSolanaBalance(address: string): Promise<string> {
  try {
    const response = await fetch('https://api.mainnet-beta.solana.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getBalance',
        params: [address]
      })
    })
    const data = await response.json()
    
    if (data.result && data.result.value !== undefined) {
      // Convert from lamports to SOL
      const balanceInSol = (data.result.value / 1e9).toFixed(4)
      return balanceInSol
    }
    return '0.00'
  } catch (error) {
    console.error('Solana balance fetch error:', error)
    return '0.00'
  }
}

// Polygon balance via PolygonScan API (free tier)
async function fetchPolygonBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.polygonscan.com/api?module=account&action=balance&address=${address}&tag=latest`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.result) {
      // Convert from Wei to MATIC
      const balanceInMatic = (parseInt(data.result) / 1e18).toFixed(4)
      return balanceInMatic
    }
    return '0.00'
  } catch (error) {
    console.error('Polygon balance fetch error:', error)
    return '0.00'
  }
}

// Binance Smart Chain balance via BscScan API (free tier)
async function fetchBinanceBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.bscscan.com/api?module=account&action=balance&address=${address}&tag=latest`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.result) {
      // Convert from Wei to BNB
      const balanceInBnb = (parseInt(data.result) / 1e18).toFixed(4)
      return balanceInBnb
    }
    return '0.00'
  } catch (error) {
    console.error('Binance balance fetch error:', error)
    return '0.00'
  }
}

// Avalanche balance via SnowTrace API (free tier)
async function fetchAvalancheBalance(address: string): Promise<string> {
  try {
    const response = await fetch(
      `https://api.snowtrace.io/api?module=account&action=balance&address=${address}&tag=latest`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.result) {
      // Convert from Wei to AVAX
      const balanceInAvax = (parseInt(data.result) / 1e18).toFixed(4)
      return balanceInAvax
    }
    return '0.00'
  } catch (error) {
    console.error('Avalanche balance fetch error:', error)
    return '0.00'
  }
}

// Cardano balance via Blockfrost API (requires free API key)
async function fetchCardanoBalance(_address: string): Promise<string> {
  try {
    // Note: Blockfrost requires API key - users would need to add this to their API Keys section
    // For now, return placeholder
    console.warn('Cardano balance requires Blockfrost API key - add to API Keys section')
    return '0.00'
  } catch (error) {
    console.error('Cardano balance fetch error:', error)
    return '0.00'
  }
}

// Ripple (XRP) balance via XRPScan API (CORS-friendly)
async function fetchRippleBalance(address: string): Promise<string> {
  try {
    // Using XRPScan public API which supports CORS
    const response = await fetch(
      `https://api.xrpscan.com/api/v1/account/${address}`
    )
    const data = await response.json()
    
    if (data && data.xrpBalance !== undefined) {
      // Balance is already in XRP format
      const balanceInXrp = parseFloat(data.xrpBalance).toFixed(4)
      return balanceInXrp
    }
    return '0.00'
  } catch (error) {
    console.error('Ripple balance fetch error:', error)
    return '0.00'
  }
}

// Cronos (CRO) balance via Cronoscan API (similar to Etherscan)
async function fetchCronosBalance(address: string): Promise<string> {
  try {
    // Using Cronoscan API (free tier, no key needed for basic queries)
    const response = await fetch(
      `https://api.cronoscan.com/api?module=account&action=balance&address=${address}`
    )
    const data = await response.json()
    
    if (data.status === '1' && data.result) {
      // Convert from wei to CRO (18 decimals)
      const balanceInCro = (parseInt(data.result) / 1e18).toFixed(4)
      return balanceInCro
    }
    return '0.00'
  } catch (error) {
    console.error('Cronos balance fetch error:', error)
    return '0.00'
  }
}
