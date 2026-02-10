// CoinGecko API integration for fetching historical cryptocurrency prices

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'

// Map blockchain names to CoinGecko coin IDs
export const BLOCKCHAIN_TO_COINGECKO_ID: Record<string, string> = {
  ethereum: 'ethereum',
  bitcoin: 'bitcoin',
  solana: 'solana',
  polygon: 'matic-network',
  binance: 'binancecoin',
  avalanche: 'avalanche-2',
  cardano: 'cardano',
  ripple: 'ripple',
  other: '' // Will need manual mapping
}

// Map blockchain names to their native token symbols
export const BLOCKCHAIN_NATIVE_TOKENS: Record<string, string> = {
  ethereum: 'ETH',
  bitcoin: 'BTC',
  solana: 'SOL',
  polygon: 'MATIC',
  binance: 'BNB',
  avalanche: 'AVAX',
  cardano: 'ADA',
  ripple: 'XRP'
}

interface HistoricalPrice {
  timestamp: number
  price: number
}

interface PriceDataPoint {
  date: string
  fullDate: string
  [walletName: string]: string | number
}

/**
 * Fetch historical price data from CoinGecko
 * @param coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @param days - Number of days of historical data (1, 7, 30, 90, 180, 365, max)
 * @returns Array of [timestamp, price] pairs
 */
export async function fetchHistoricalPrices(
  coinId: string,
  days: number | 'max'
): Promise<HistoricalPrice[]> {
  try {
    const daysParam = days === 'max' ? 'max' : days.toString()
    const url = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${daysParam}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    // CoinGecko returns prices as [[timestamp, price], ...]
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price
    }))
  } catch (error) {
    console.error(`Failed to fetch prices for ${coinId}:`, error)
    return []
  }
}

/**
 * Get the appropriate CoinGecko days parameter for a time range
 */
export function getCoingeckoDaysParam(timeRange: string): number | 'max' {
  const daysMap: Record<string, number | 'max'> = {
    '1d': 1,
    '3d': 3,
    '1w': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
    '5y': 1825,
    '10y': 3650,
    'all': 'max'
  }
  return daysMap[timeRange] || 30
}

/**
 * Calculate historical wallet values based on current balance and historical prices
 */
export function calculateHistoricalWalletValues(
  currentBalance: number,
  historicalPrices: HistoricalPrice[]
): Map<number, number> {
  const values = new Map<number, number>()
  
  for (const { timestamp, price } of historicalPrices) {
    const value = currentBalance * price
    values.set(timestamp, value)
  }
  
  return values
}

/**
 * Merge multiple wallet historical values into chart data points
 */
export function mergeWalletDataIntoChartPoints(
  walletHistoricalData: Map<string, Map<number, number>>
): PriceDataPoint[] {
  // Get all unique timestamps
  const allTimestamps = new Set<number>()
  for (const walletData of walletHistoricalData.values()) {
    for (const timestamp of walletData.keys()) {
      allTimestamps.add(timestamp)
    }
  }
  
  // Sort timestamps
  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b)
  
  // Create data points
  const dataPoints: PriceDataPoint[] = sortedTimestamps.map(timestamp => {
    const date = new Date(timestamp)
    const dataPoint: PriceDataPoint = {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString()
    }
    
    // Add each wallet's value at this timestamp
    for (const [walletName, walletData] of walletHistoricalData.entries()) {
      const value = walletData.get(timestamp)
      if (value !== undefined) {
        dataPoint[walletName] = parseFloat(value.toFixed(2))
      }
    }
    
    return dataPoint
  })
  
  return dataPoints
}

/**
 * Fetch and process historical data for multiple wallets
 */
export async function fetchWalletPortfolioHistory(
  wallets: Array<{ wallet_name: string; blockchain: string; balance: number }>,
  timeRange: string
): Promise<PriceDataPoint[]> {
  const days = getCoingeckoDaysParam(timeRange)
  const walletHistoricalData = new Map<string, Map<number, number>>()
  
  // Fetch price data for each unique blockchain
  const blockchainPrices = new Map<string, HistoricalPrice[]>()
  
  for (const wallet of wallets) {
    const coinId = BLOCKCHAIN_TO_COINGECKO_ID[wallet.blockchain]
    if (!coinId) continue
    
    // Only fetch once per blockchain
    if (!blockchainPrices.has(wallet.blockchain)) {
      const prices = await fetchHistoricalPrices(coinId, days)
      blockchainPrices.set(wallet.blockchain, prices)
    }
    
    const prices = blockchainPrices.get(wallet.blockchain)!
    const walletValues = calculateHistoricalWalletValues(
      wallet.balance,
      prices
    )
    
    walletHistoricalData.set(wallet.wallet_name, walletValues)
  }
  
  return mergeWalletDataIntoChartPoints(walletHistoricalData)
}
