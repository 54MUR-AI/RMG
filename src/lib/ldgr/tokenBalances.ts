// Token balance fetching for ERC-20 and other token standards
// Supports Ethereum, Cronos, Polygon, BSC, Avalanche

export interface TokenInfo {
  symbol: string
  name: string
  balance: string
  decimals: number
  contract_address: string
  type: 'ERC20' | 'native'
}

// Map blockchain to their explorer API endpoints
// Note: Cronos Explorer API requires authentication, so it's excluded
const EXPLORER_APIS: Record<string, string> = {
  ethereum: 'https://api.etherscan.io/api',
  polygon: 'https://api.polygonscan.com/api',
  binance: 'https://api.bscscan.com/api',
  avalanche: 'https://api.snowtrace.io/api'
}

/**
 * Fetch all ERC-20 token balances for an address on EVM-compatible chains
 * Uses blockchain explorer APIs (Etherscan, Cronoscan, etc.)
 */
export async function fetchERC20Tokens(
  address: string,
  blockchain: string
): Promise<TokenInfo[]> {
  const apiUrl = EXPLORER_APIS[blockchain]
  
  if (!apiUrl) {
    console.log(`Token fetching not supported for ${blockchain}`)
    return []
  }

  try {
    // Fetch token list from explorer API
    const response = await fetch(
      `${apiUrl}?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=asc`
    )
    const data = await response.json()

    // Check for API errors
    if (data.message && data.message.includes('not supported')) {
      console.warn(`Transaction history not supported for ${blockchain}, skipping token fetch`)
      return []
    }

    if (data.status !== '1' || !data.result || data.result.length === 0) {
      console.log(`No tokens found for ${address} on ${blockchain}`)
      return []
    }

    // Extract unique token contracts
    const tokenContracts = new Map<string, any>()
    
    for (const tx of data.result) {
      if (!tokenContracts.has(tx.contractAddress)) {
        tokenContracts.set(tx.contractAddress, {
          contract_address: tx.contractAddress,
          symbol: tx.tokenSymbol,
          name: tx.tokenName,
          decimals: parseInt(tx.tokenDecimal)
        })
      }
    }

    // Fetch current balance for each token
    const tokens: TokenInfo[] = []
    
    for (const [contractAddress, tokenInfo] of tokenContracts) {
      try {
        const balanceResponse = await fetch(
          `${apiUrl}?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${address}`
        )
        const balanceData = await balanceResponse.json()

        if (balanceData.status === '1' && balanceData.result) {
          const balance = parseInt(balanceData.result)
          
          // Only include tokens with non-zero balance
          if (balance > 0) {
            const balanceFormatted = (balance / Math.pow(10, tokenInfo.decimals)).toFixed(4)
            
            tokens.push({
              symbol: tokenInfo.symbol,
              name: tokenInfo.name,
              balance: balanceFormatted,
              decimals: tokenInfo.decimals,
              contract_address: contractAddress,
              type: 'ERC20'
            })
          }
        }
      } catch (error) {
        console.error(`Error fetching balance for token ${contractAddress}:`, error)
      }
    }

    console.log(`📊 Found ${tokens.length} tokens for ${address} on ${blockchain}`)
    return tokens

  } catch (error) {
    console.error(`Error fetching tokens for ${blockchain}:`, error)
    return []
  }
}

/**
 * Fetch token price from CoinGecko by contract address
 * Returns price in USD
 */
export async function fetchTokenPrice(
  contractAddress: string,
  blockchain: string
): Promise<number> {
  try {
    // Map blockchain names to CoinGecko platform IDs
    const platformMap: Record<string, string> = {
      ethereum: 'ethereum',
      cronos: 'cronos',
      polygon: 'polygon-pos',
      binance: 'binance-smart-chain',
      avalanche: 'avalanche'
    }

    const platform = platformMap[blockchain]
    if (!platform) {
      console.warn(`Platform mapping not found for ${blockchain}`)
      return 0
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${contractAddress}&vs_currencies=usd`
    )
    const data = await response.json()

    const price = data[contractAddress.toLowerCase()]?.usd || 0
    console.log(`💰 Token ${contractAddress} price: $${price}`)
    
    return price

  } catch (error) {
    console.error(`Error fetching token price for ${contractAddress}:`, error)
    return 0
  }
}

/**
 * Calculate USD value for a token
 */
export function calculateTokenValue(
  balance: string,
  pricePerToken: number
): string {
  const balanceNum = parseFloat(balance)
  const usdValue = balanceNum * pricePerToken
  return usdValue > 0 ? `$${usdValue.toFixed(2)}` : '$0.00'
}
