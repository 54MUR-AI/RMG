// Multi-token balance fetching - extends single balance to include all tokens
import { fetchERC20Tokens, fetchTokenPrice } from './tokenBalances'
import type { TokenBalance, MultiTokenBalance } from './cryptoWallets'
import { fetchCryptoPrice } from './cryptoWallets'
import { BLOCKCHAIN_NATIVE_TOKENS } from './cryptoPrices'

/**
 * Fetch complete wallet balance including native token and all ERC-20 tokens
 * Returns MultiTokenBalance with full token list and total USD value
 */
export async function fetchMultiTokenBalance(
  address: string,
  blockchain: string,
  nativeBalance: string
): Promise<MultiTokenBalance> {
  try {
    // Get native token info
    const nativePrice = await fetchCryptoPrice(blockchain)
    const nativeBalanceNum = parseFloat(nativeBalance)
    const nativeUsdValue = nativeBalanceNum * nativePrice
    const nativeSymbol = BLOCKCHAIN_NATIVE_TOKENS[blockchain] || blockchain.toUpperCase()

    const nativeToken: TokenBalance = {
      symbol: nativeSymbol,
      name: blockchain.charAt(0).toUpperCase() + blockchain.slice(1),
      balance: nativeBalance,
      decimals: 18,
      usd_value: nativeUsdValue > 0 ? `$${nativeUsdValue.toFixed(2)}` : '$0.00',
      price_per_token: nativePrice
    }

    // Check if blockchain supports ERC-20 tokens
    const supportsTokens = ['ethereum', 'cronos', 'polygon', 'binance', 'avalanche'].includes(blockchain)
    
    if (!supportsTokens) {
      // Return only native token for non-EVM chains
      return {
        native_token: nativeToken,
        tokens: [],
        total_usd_value: nativeToken.usd_value,
        last_updated: new Date().toISOString()
      }
    }

    // Fetch ERC-20 tokens
    console.log(`🔍 Fetching tokens for ${address} on ${blockchain}...`)
    const tokenInfos = await fetchERC20Tokens(address, blockchain)
    
    // Fetch prices and calculate USD values for each token
    const tokens: TokenBalance[] = []
    let totalUsdValue = nativeUsdValue

    for (const tokenInfo of tokenInfos) {
      const price = await fetchTokenPrice(tokenInfo.contract_address, blockchain)
      const balanceNum = parseFloat(tokenInfo.balance)
      const usdValue = balanceNum * price

      tokens.push({
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        balance: tokenInfo.balance,
        decimals: tokenInfo.decimals,
        contract_address: tokenInfo.contract_address,
        usd_value: usdValue > 0 ? `$${usdValue.toFixed(2)}` : '$0.00',
        price_per_token: price
      })

      totalUsdValue += usdValue
    }

    console.log(`✅ Found ${tokens.length} tokens with total value: $${totalUsdValue.toFixed(2)}`)

    return {
      native_token: nativeToken,
      tokens,
      total_usd_value: totalUsdValue > 0 ? `$${totalUsdValue.toFixed(2)}` : '$0.00',
      last_updated: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error fetching multi-token balance:', error)
    
    // Return minimal data on error
    const nativePrice = await fetchCryptoPrice(blockchain)
    const nativeBalanceNum = parseFloat(nativeBalance)
    const nativeUsdValue = nativeBalanceNum * nativePrice
    const nativeSymbol = BLOCKCHAIN_NATIVE_TOKENS[blockchain] || blockchain.toUpperCase()

    return {
      native_token: {
        symbol: nativeSymbol,
        name: blockchain.charAt(0).toUpperCase() + blockchain.slice(1),
        balance: nativeBalance,
        decimals: 18,
        usd_value: nativeUsdValue > 0 ? `$${nativeUsdValue.toFixed(2)}` : '$0.00',
        price_per_token: nativePrice
      },
      tokens: [],
      total_usd_value: nativeUsdValue > 0 ? `$${nativeUsdValue.toFixed(2)}` : '$0.00',
      last_updated: new Date().toISOString()
    }
  }
}
