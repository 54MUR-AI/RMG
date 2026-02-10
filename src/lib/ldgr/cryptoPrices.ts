// CoinGecko API integration for fetching historical cryptocurrency prices
import { getWalletHistoricalData } from './blockchainHistory'

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3'
const USE_CORS_PROXY = false // Try direct API call first
const CORS_PROXY = 'https://api.allorigins.win/raw?url=' // Alternative CORS proxy
const USE_REAL_BLOCKCHAIN_DATA = true // Use real blockchain transaction history

// Cache for API responses to avoid rate limiting
const priceCache = new Map<string, { data: HistoricalPrice[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
    const cacheKey = `${coinId}-${daysParam}`
    
    // Check cache first
    const cached = priceCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`📊 Using cached data for ${coinId}`)
      return cached.data
    }
    
    const baseUrl = `${COINGECKO_API_BASE}/coins/${coinId}/market_chart?vs_currency=usd&days=${daysParam}`
    const url = USE_CORS_PROXY ? `${CORS_PROXY}${encodeURIComponent(baseUrl)}` : baseUrl
    
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`CoinGecko API error: ${response.status} ${response.statusText}`)
      return []
    }
    
    const data = await response.json()
    console.log(`📊 CoinGecko API response structure:`, {
      hasPrices: !!data.prices,
      pricesType: typeof data.prices,
      pricesLength: data.prices?.length,
      sampleData: data.prices?.[0]
    })
    
    // Validate response structure
    if (!data.prices || !Array.isArray(data.prices)) {
      console.error(`Invalid CoinGecko response format:`, data)
      return []
    }
    
    // CoinGecko returns prices as [[timestamp, price], ...]
    const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price
    }))
    
    console.log(`📊 Fetched ${prices.length} real price points from CoinGecko for ${coinId}`)
    
    // Cache the result
    priceCache.set(cacheKey, { data: prices, timestamp: Date.now() })
    
    return prices
  } catch (error) {
    console.error(`Failed to fetch prices for ${coinId}:`, error)
    return []
  }
}

/**
 * Get the appropriate CoinGecko days parameter for a time range
 */
export function getCoingeckoDaysParam(timeRange: string): number {
  const daysMap: Record<string, number> = {
    '1d': 1,
    '3d': 3,
    '1w': 7,
    '1m': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
    // CoinGecko free API limits historical data to 365 days
    // For longer periods, we cap at 365 days
    '5y': 365,
    '10y': 365,
    'all': 365
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
  wallets: Array<{ wallet_name: string; blockchain: string; balance: number; address?: string }>,
  timeRange: string
): Promise<PriceDataPoint[]> {
  const days = getCoingeckoDaysParam(timeRange)
  const walletHistoricalData = new Map<string, Map<number, number>>()
  
  for (const wallet of wallets) {
    // Try to use real blockchain data first
    if (USE_REAL_BLOCKCHAIN_DATA && wallet.address) {
      const currentPrice = getCurrentPrice(wallet.blockchain)
      
      try {
        const realData = await getWalletHistoricalData(
          wallet.address,
          wallet.blockchain,
          wallet.balance,
          currentPrice,
          typeof days === 'number' ? days : 365
        )
        
        if (realData.length > 0) {
          console.log(`📊 Using real blockchain data for ${wallet.wallet_name}`)
          const valueMap = new Map<number, number>()
          realData.forEach(point => {
            valueMap.set(point.timestamp, point.value)
          })
          walletHistoricalData.set(wallet.wallet_name, valueMap)
          continue
        }
      } catch (error) {
        console.warn(`Failed to get real blockchain data for ${wallet.wallet_name}`)
      }
    }
    
    // Try to fetch real historical prices from CoinGecko
    const coinId = BLOCKCHAIN_TO_COINGECKO_ID[wallet.blockchain]
    if (!coinId) {
      console.warn(`No CoinGecko ID for ${wallet.blockchain}`)
      continue
    }
    
    console.log(`📊 Fetching real historical prices for ${coinId}`)
    const prices = await fetchHistoricalPrices(coinId, days)
    
    if (prices.length === 0) {
      console.error(`No price data available for ${wallet.wallet_name}`)
      continue
    }
    
    const walletValues = calculateHistoricalWalletValues(
      wallet.balance,
      prices
    )
    
    walletHistoricalData.set(wallet.wallet_name, walletValues)
  }
  
  return mergeWalletDataIntoChartPoints(walletHistoricalData)
}

function getCurrentPrice(blockchain: string): number {
  const currentPrices: Record<string, number> = {
    bitcoin: 95000,
    ethereum: 3500,
    ripple: 1.40,
    solana: 150,
    polygon: 0.90,
    binance: 600,
    avalanche: 40,
    cardano: 0.60
  }
  return currentPrices[blockchain] || 1.0
}
