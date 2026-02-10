// Blockchain address format detection and validation

export type BlockchainType = 
  | 'ethereum' | 'polygon' | 'binance' | 'avalanche' | 'cronos' // EVM chains
  | 'bitcoin' | 'solana' | 'cardano' | 'ripple' | 'other'

export interface AddressDetectionResult {
  detectedBlockchains: BlockchainType[]
  isAmbiguous: boolean
  addressFormat: string
}

/**
 * Detect blockchain(s) from wallet address format
 * Returns array of possible blockchains (multiple for EVM addresses)
 */
export function detectBlockchainFromAddress(address: string): AddressDetectionResult {
  if (!address || address.trim().length === 0) {
    return {
      detectedBlockchains: [],
      isAmbiguous: false,
      addressFormat: 'invalid'
    }
  }

  const trimmedAddress = address.trim()

  // Bitcoin addresses
  if (isBitcoinAddress(trimmedAddress)) {
    return {
      detectedBlockchains: ['bitcoin'],
      isAmbiguous: false,
      addressFormat: 'Bitcoin'
    }
  }

  // Ripple (XRP) addresses
  if (isRippleAddress(trimmedAddress)) {
    return {
      detectedBlockchains: ['ripple'],
      isAmbiguous: false,
      addressFormat: 'Ripple'
    }
  }

  // Cardano addresses
  if (isCardanoAddress(trimmedAddress)) {
    return {
      detectedBlockchains: ['cardano'],
      isAmbiguous: false,
      addressFormat: 'Cardano'
    }
  }

  // Solana addresses
  if (isSolanaAddress(trimmedAddress)) {
    return {
      detectedBlockchains: ['solana'],
      isAmbiguous: false,
      addressFormat: 'Solana'
    }
  }

  // EVM addresses (Ethereum, Polygon, BSC, Avalanche, Cronos)
  if (isEVMAddress(trimmedAddress)) {
    return {
      detectedBlockchains: ['ethereum', 'polygon', 'binance', 'avalanche', 'cronos'],
      isAmbiguous: true,
      addressFormat: 'EVM (Ethereum/Polygon/BSC/Avalanche/Cronos)'
    }
  }

  // Unknown format
  return {
    detectedBlockchains: [],
    isAmbiguous: false,
    addressFormat: 'Unknown'
  }
}

/**
 * Check if address is valid EVM format (0x + 40 hex chars)
 */
function isEVMAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Check if address is valid Bitcoin format
 * Supports Legacy (1...), SegWit (3...), and Bech32 (bc1...)
 */
function isBitcoinAddress(address: string): boolean {
  // Legacy P2PKH (starts with 1)
  const legacyRegex = /^1[a-km-zA-HJ-NP-Z1-9]{25,34}$/
  // SegWit P2SH (starts with 3)
  const segwitRegex = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/
  // Bech32 (starts with bc1)
  const bech32Regex = /^bc1[a-z0-9]{39,59}$/

  return legacyRegex.test(address) || segwitRegex.test(address) || bech32Regex.test(address)
}

/**
 * Check if address is valid Solana format
 * Base58 encoded, 32-44 characters
 */
function isSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded, typically 32-44 chars
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  
  // Exclude addresses that look like Bitcoin (start with 1, 3, or bc1)
  if (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) {
    return false
  }
  
  return base58Regex.test(address)
}

/**
 * Check if address is valid Cardano format
 * Shelley era addresses start with 'addr1'
 */
function isCardanoAddress(address: string): boolean {
  // Shelley mainnet addresses start with addr1
  return address.startsWith('addr1') && address.length >= 58 && address.length <= 104
}

/**
 * Check if address is valid Ripple (XRP) format
 * Starts with 'r' and is 25-34 characters
 */
function isRippleAddress(address: string): boolean {
  return /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/.test(address)
}

/**
 * Validate if an address matches the expected blockchain format
 */
export function validateAddressForBlockchain(address: string, blockchain: BlockchainType): boolean {
  const detection = detectBlockchainFromAddress(address)
  return detection.detectedBlockchains.includes(blockchain)
}

/**
 * Get user-friendly message about detected address format
 */
export function getAddressFormatMessage(address: string): string {
  const detection = detectBlockchainFromAddress(address)
  
  if (detection.detectedBlockchains.length === 0) {
    return 'Unknown address format'
  }
  
  if (detection.isAmbiguous) {
    return `Detected: ${detection.addressFormat} - Please select the specific network`
  }
  
  return `Detected: ${detection.addressFormat}`
}
