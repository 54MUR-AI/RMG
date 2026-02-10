// Blockchain API integration for fetching real historical wallet data

interface Transaction {
  date: string
  timestamp: number
  balance: number
  type: string
  amount: number
}

interface HistoricalBalance {
  timestamp: number
  balance: number
  usdValue: number
}

// XRP Ledger public API endpoints
const XRP_API_ENDPOINTS = [
  'https://xrplcluster.com',
  'https://s1.ripple.com:51234',
  'https://s2.ripple.com:51234'
]

/**
 * Fetch XRP wallet transaction history from XRP Ledger
 */
async function fetchXRPTransactionHistory(address: string): Promise<Transaction[]> {
  try {
    console.log(`📊 Fetching XRP transactions for address: ${address}`)
    
    // Use XRP Ledger JSON-RPC API
    const response = await fetch(XRP_API_ENDPOINTS[0], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'account_tx',
        params: [{
          account: address,
          ledger_index_min: -1,
          ledger_index_max: -1,
          limit: 200,
          forward: false
        }]
      })
    })

    if (!response.ok) {
      console.error(`📊 XRP API HTTP error: ${response.status}`)
      throw new Error(`XRP API error: ${response.status}`)
    }

    const data = await response.json()
    
    console.log('📊 XRP Ledger API full response:', data)
    console.log('📊 XRP Ledger API response summary:', {
      status: data.result?.status,
      transactionCount: data.result?.transactions?.length || 0,
      error: data.result?.error,
      errorMessage: data.result?.error_message
    })
    
    if (data.result?.status !== 'success') {
      throw new Error('Failed to fetch XRP transactions')
    }

    const transactions: Transaction[] = []
    const txs = data.result.transactions || []

    for (const tx of txs) {
      const meta = tx.meta
      const txData = tx.tx
      
      // Calculate balance after this transaction
      let balance = 0
      if (meta?.delivered_amount) {
        balance = typeof meta.delivered_amount === 'string' 
          ? parseFloat(meta.delivered_amount) / 1000000 // Convert drops to XRP
          : meta.delivered_amount.value || 0
      }

      const timestamp = (txData.date + 946684800) * 1000
      transactions.push({
        date: new Date(timestamp).toISOString(),
        timestamp: timestamp,
        balance: balance,
        type: txData.TransactionType,
        amount: balance
      })
    }

    const sorted = transactions.sort((a, b) => a.timestamp - b.timestamp)
    console.log(`📊 Parsed ${sorted.length} XRP transactions, date range:`, {
      first: sorted[0]?.date,
      last: sorted[sorted.length - 1]?.date
    })
    return sorted
  } catch (error) {
    console.error('Error fetching XRP transaction history:', error)
    return []
  }
}

/**
 * Fetch Ethereum wallet transaction history
 */
async function fetchEthereumTransactionHistory(_address: string): Promise<Transaction[]> {
  try {
    // Use Etherscan-like API (would need API key for production)
    // For now, return empty to use fallback
    console.warn('Ethereum transaction history not yet implemented')
    return []
  } catch (error) {
    console.error('Error fetching Ethereum transaction history:', error)
    return []
  }
}

/**
 * Fetch Bitcoin wallet transaction history
 */
async function fetchBitcoinTransactionHistory(_address: string): Promise<Transaction[]> {
  try {
    // Use Blockchain.info or similar API
    console.warn('Bitcoin transaction history not yet implemented')
    return []
  } catch (error) {
    console.error('Error fetching Bitcoin transaction history:', error)
    return []
  }
}

/**
 * Fetch transaction history for any blockchain
 */
export async function fetchWalletTransactionHistory(
  address: string,
  blockchain: string
): Promise<Transaction[]> {
  console.log(`📊 Fetching real transaction history for ${blockchain} wallet: ${address}`)
  
  switch (blockchain.toLowerCase()) {
    case 'ripple':
    case 'xrp':
      return fetchXRPTransactionHistory(address)
    case 'ethereum':
    case 'eth':
      return fetchEthereumTransactionHistory(address)
    case 'bitcoin':
    case 'btc':
      return fetchBitcoinTransactionHistory(address)
    default:
      console.warn(`Transaction history not supported for ${blockchain}`)
      return []
  }
}

/**
 * Calculate historical balances from transaction history
 */
export function calculateHistoricalBalances(
  _transactions: Transaction[],
  _currentBalance: number,
  _currentPrice: number,
  _days: number
): HistoricalBalance[] {
  // This function is no longer used for generating fake data
  // Real historical prices come from CoinGecko API via cryptoPrices.ts
  console.log(`📊 calculateHistoricalBalances called but not used - using real price data instead`)
  return []
}

/**
 * Get real historical wallet data for charting
 */
export async function getWalletHistoricalData(
  address: string,
  blockchain: string,
  currentBalance: number,
  currentPrice: number,
  days: number
): Promise<{ timestamp: number; value: number }[]> {
  try {
    const transactions = await fetchWalletTransactionHistory(address, blockchain)
    
    console.log(`📊 Found ${transactions.length} transactions for ${blockchain} wallet`)
    
    if (transactions.length === 0) {
      console.log('📊 No transaction history found, will use current balance with historical prices')
      // Even without transaction history, we can show historical value
      // by using current balance × historical price for each day
      // This will be handled by the fallback in cryptoPrices.ts
      return []
    }

    const historicalBalances = calculateHistoricalBalances(
      transactions,
      currentBalance,
      currentPrice,
      days
    )

    return historicalBalances.map(hb => ({
      timestamp: hb.timestamp,
      value: hb.usdValue
    }))
  } catch (error) {
    console.error('Error getting wallet historical data:', error)
    return []
  }
}
