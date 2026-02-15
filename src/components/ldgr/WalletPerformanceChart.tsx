import { useState, useEffect, useMemo, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import type { CryptoWallet, WalletBalance, MultiTokenBalance } from '../../lib/ldgr/cryptoWallets'
import { fetchWalletPortfolioHistory } from '../../lib/ldgr/cryptoPrices'
import { fetchYahooHistory, toTroyOz, type AssetWithPrice, EQUITY_TYPES, METAL_TYPES } from '../../lib/ldgr/assets'

const METAL_YAHOO: Record<string, string> = {
  gold: 'GC=F', silver: 'SI=F', platinum: 'PL=F', palladium: 'PA=F',
}

interface WalletPerformanceChartProps {
  wallets: CryptoWallet[]
  balances: Record<string, WalletBalance | MultiTokenBalance>
  filterBlockchain: string
  assets?: AssetWithPrice[]
}

const ASSET_COLORS: Record<string, string> = {
  stock: '#3b82f6',     // blue
  etf: '#60a5fa',       // light blue
  mutf: '#2563eb',      // darker blue
  gold: '#fbbf24',      // gold
  silver: '#c0c0c0',    // silver
  platinum: '#e5e4e2',  // platinum
  palladium: '#b8b0a0', // palladium
  metal_other: '#a8a29e', // stone
  commodity: '#f97316', // orange
  crypto: '#a855f7',    // purple
  tokenized: '#8b5cf6', // violet
}

// Map crypto ticker symbols to blockchain names for manual positions
const SYMBOL_TO_BLOCKCHAIN: Record<string, string> = {
  ETH: 'ethereum', BTC: 'bitcoin', SOL: 'solana', MATIC: 'polygon',
  BNB: 'binance', AVAX: 'avalanche', ADA: 'cardano', XRP: 'ripple',
  CRO: 'cronos',
}

const BLOCKCHAIN_COLORS: Record<string, string> = {
  ethereum: '#a855f7',    // purple
  bitcoin: '#f59e0b',     // amber/orange (BTC brand)
  solana: '#9333ea',      // dark purple
  polygon: '#8b5cf6',     // violet
  binance: '#c084fc',     // light purple
  avalanche: '#7c3aed',   // deep violet
  cardano: '#6d28d9',     // indigo-purple
  ripple: '#d8b4fe',      // lavender
  cronos: '#a78bfa',      // medium purple
  other: '#7e22ce'        // purple fallback
}

type TimeRange = '1d' | '3d' | '1w' | '1m' | '3m' | '6m' | '1y' | '5y' | '10y' | 'all'

export default function WalletPerformanceChart({ wallets, balances, filterBlockchain, assets = [] }: WalletPerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m')
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Filter wallets based on blockchain filter
  const filteredWallets = useMemo(() => 
    wallets.filter(wallet => 
      filterBlockchain === 'all' || wallet.blockchain === filterBlockchain
    ),
    [wallets, filterBlockchain]
  )

  // Equity and metal assets that have a symbol for historical data
  const equityAssets = useMemo(() => assets.filter(a => EQUITY_TYPES.includes(a.asset_type) && a.symbol), [assets])
  const metalAssets = useMemo(() => assets.filter(a => METAL_TYPES.includes(a.asset_type) && a.asset_type !== 'metal_other'), [assets])
  const cryptoAssets = useMemo(() => assets.filter(a => a.asset_type === 'crypto' && a.symbol), [assets])

  const generateChartData = useCallback(async () => {
    setLoading(true)
    
    try {
      // ── Crypto wallet data ──
      const walletsWithBalances = filteredWallets
        .map(wallet => {
          const balance = balances[wallet.address]
          if (!balance) return null
          
          let tokenAmount = 0
          if (isMultiTokenBalance(balance)) {
            tokenAmount = parseFloat(balance.native_token.balance)
          } else {
            tokenAmount = typeof balance.balance === 'number' 
              ? balance.balance 
              : parseFloat(balance.balance)
          }
          
          if (isNaN(tokenAmount) || tokenAmount <= 0) return null
          
          return {
            wallet_name: wallet.wallet_name,
            blockchain: wallet.blockchain,
            balance: tokenAmount,
            address: wallet.address
          }
        })
        .filter((w): w is NonNullable<typeof w> => w !== null)

      // Add manual crypto positions as virtual wallets
      for (const a of cryptoAssets) {
        const sym = (a.symbol || '').toUpperCase()
        const blockchain = SYMBOL_TO_BLOCKCHAIN[sym]
        if (blockchain && a.quantity > 0) {
          walletsWithBalances.push({
            wallet_name: a.asset_name,
            blockchain,
            balance: a.quantity,
            address: `manual-${a.id}`,
          })
        }
      }

      const hasCrypto = walletsWithBalances.length > 0
      const hasEquities = equityAssets.length > 0
      const hasMetals = metalAssets.length > 0

      if (!hasCrypto && !hasEquities && !hasMetals) {
        setChartData([])
        setLoading(false)
        return
      }

      // Fetch crypto history
      let cryptoData: any[] = []
      if (hasCrypto) {
        cryptoData = await fetchWalletPortfolioHistory(walletsWithBalances, timeRange)
      }

      // ── Equity / Metal history via Yahoo Finance ──
      const yahooSymbols: { label: string; symbol: string; qty: number }[] = []
      for (const a of equityAssets) {
        yahooSymbols.push({ label: a.asset_name, symbol: a.symbol!, qty: a.quantity })
      }
      for (const a of metalAssets) {
        const ySym = METAL_YAHOO[a.asset_type]
        if (ySym) {
          const qty = a.weight_unit ? toTroyOz(a.quantity, a.weight_unit) : a.quantity
          yahooSymbols.push({ label: a.asset_name, symbol: ySym, qty })
        }
      }

      // Fetch all Yahoo histories in parallel
      const yahooHistories = await Promise.all(
        yahooSymbols.map(s => fetchYahooHistory(s.symbol, timeRange))
      )

      // Merge Yahoo data into chart points
      // Use crypto dates as base if available, otherwise build from Yahoo data
      let merged: any[] = cryptoData.length > 0 ? cryptoData : []

      if (yahooSymbols.length > 0) {
        // Build a date→index map from the longest Yahoo series
        const longestIdx = yahooHistories.reduce((best, h, i) => h.length > (yahooHistories[best]?.length || 0) ? i : best, 0)
        const yahooDates = yahooHistories[longestIdx]?.map(p => p.date) || []

        if (merged.length === 0) {
          // No crypto data — build chart from Yahoo dates
          merged = yahooDates.map(d => ({ date: d }))
        }

        // For each Yahoo symbol, map its values onto the merged array
        for (let si = 0; si < yahooSymbols.length; si++) {
          const { label, qty } = yahooSymbols[si]
          const hist = yahooHistories[si]
          if (!hist || hist.length === 0) continue

          // Build a date→close map for this symbol
          const dateMap = new Map(hist.map(p => [p.date, p.close]))

          // If merged was built from crypto (different dates), interpolate by index ratio
          if (cryptoData.length > 0 && hist.length > 0) {
            for (let i = 0; i < merged.length; i++) {
              const ratio = hist.length > 1 ? i / (merged.length - 1) : 0
              const hi = Math.min(Math.round(ratio * (hist.length - 1)), hist.length - 1)
              merged[i][label] = +(hist[hi].close * qty).toFixed(2)
            }
          } else {
            // Dates match (Yahoo-only chart)
            for (let i = 0; i < merged.length; i++) {
              const close = dateMap.get(merged[i].date)
              if (close != null) {
                merged[i][label] = +(close * qty).toFixed(2)
              }
            }
          }
        }
      }

      setChartData(merged)
    } catch (error) {
      console.error('📊 Error fetching chart data:', error)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }, [filteredWallets, balances, timeRange, equityAssets, metalAssets, cryptoAssets])

  useEffect(() => {
    generateChartData()
  }, [generateChartData])

  // Helper to check if balance is MultiTokenBalance
  const isMultiTokenBalance = (balance: WalletBalance | MultiTokenBalance): balance is MultiTokenBalance => {
    return 'native_token' in balance && 'tokens' in balance && 'total_usd_value' in balance
  }

  // Calculate total portfolio value (crypto + stocks + metals)
  const totalValue = useMemo(() => {
    // Crypto wallets
    const cryptoTotal = filteredWallets.reduce((sum, wallet) => {
      const balance = balances[wallet.address]
      if (!balance) return sum
      
      let value = 0
      if (isMultiTokenBalance(balance)) {
        const usdValue = balance.total_usd_value
        if (typeof usdValue === 'string') value = parseFloat(usdValue.replace('$', ''))
      } else {
        if (typeof balance.usd_value === 'number') value = balance.usd_value
        else if (typeof balance.usd_value === 'string') value = parseFloat(balance.usd_value.replace('$', ''))
      }
      return sum + (isNaN(value) ? 0 : value)
    }, 0)

    // Stocks + metals
    const assetTotal = assets.reduce((sum, a) => sum + (a.currentValue || 0), 0)

    return cryptoTotal + assetTotal
  }, [filteredWallets, balances, assets])

  // Calculate gain/loss for selected timeframe from chart data
  const { changePercent, isPositive, periodLabel } = useMemo(() => {
    if (chartData.length < 2) {
      return { changePercent: 0, isPositive: true, periodLabel: timeRange.toUpperCase() }
    }
    
    // Get first and last values from chart data
    const firstPoint = chartData[0]
    const lastPoint = chartData[chartData.length - 1]
    
    // Calculate total value at start and end
    let startValue = 0
    let endValue = 0
    
    // Sum all series (crypto wallets + stock/metal assets)
    const allKeys = Object.keys(firstPoint).filter(k => k !== 'date' && k !== 'fullDate')
    allKeys.forEach(key => {
      if (firstPoint[key]) startValue += Number(firstPoint[key])
      if (lastPoint[key]) endValue += Number(lastPoint[key])
    })
    
    // Calculate percentage change
    const change = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0
    
    return {
      changePercent: change,
      isPositive: change >= 0,
      periodLabel: timeRange.toUpperCase()
    }
  }, [chartData, timeRange])

  if (filteredWallets.length === 0 && assets.length === 0) {
    return null
  }

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-samurai-red" />
            <h3 className="text-lg font-bold text-white">
              {filterBlockchain === 'all' ? 'Portfolio Performance' : `${filterBlockchain.charAt(0).toUpperCase() + filterBlockchain.slice(1)} Performance`}
            </h3>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}% ({periodLabel})
            </span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-samurai-steel hidden sm:block" />
          <div className="flex flex-wrap gap-1 bg-samurai-black-lighter rounded-lg p-1">
            {(['1d', '3d', '1w', '1m', '3m', '6m', '1y', '5y', '10y', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-samurai-red text-white'
                    : 'text-samurai-steel hover:text-white hover:bg-samurai-grey-dark'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="inline-block w-8 h-8 border-4 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              tick={{ fill: '#9CA3AF' }}
              tickFormatter={(value: number) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null
                
                return (
                  <div className="bg-[#0a0a0a] border border-samurai-red/60 rounded-lg p-3 shadow-xl" style={{ opacity: 1 }}>
                    <p className="text-xs text-white/70 mb-1.5 font-mono">{label}</p>
                    {payload.map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-white font-semibold">{entry.name}:</span>
                        <span className="text-xs text-white/80 font-mono">
                          ${Number(entry.value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                    <div className="mt-1.5 pt-1.5 border-t border-white/20">
                      <span className="text-sm text-white font-bold">
                        Total: ${payload.reduce((sum: number, entry: any) => sum + Number(entry.value || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                )
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            {filteredWallets.map((wallet) => (
              <Line
                key={wallet.id}
                type="monotone"
                dataKey={wallet.wallet_name}
                stroke={BLOCKCHAIN_COLORS[wallet.blockchain] || '#6B7280'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: BLOCKCHAIN_COLORS[wallet.blockchain] || '#7e22ce', stroke: BLOCKCHAIN_COLORS[wallet.blockchain] || '#7e22ce', strokeWidth: 2 }}
                connectNulls={true}
              />
            ))}
            {equityAssets.map((a) => (
              <Line
                key={a.id}
                type="monotone"
                dataKey={a.asset_name}
                stroke={ASSET_COLORS[a.asset_type] || '#3b82f6'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: ASSET_COLORS[a.asset_type] || '#3b82f6', stroke: ASSET_COLORS[a.asset_type] || '#3b82f6', strokeWidth: 2 }}
                connectNulls={true}
              />
            ))}
            {metalAssets.map((a) => (
              <Line
                key={a.id}
                type="monotone"
                dataKey={a.asset_name}
                stroke={ASSET_COLORS[a.asset_type] || '#eab308'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: ASSET_COLORS[a.asset_type] || '#fbbf24', stroke: ASSET_COLORS[a.asset_type] || '#fbbf24', strokeWidth: 2 }}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend Info */}
      <div className="mt-4 pt-4 border-t border-samurai-grey-dark">
        <p className="text-xs text-samurai-steel text-center">
          Showing {filteredWallets.length} wallet{filteredWallets.length !== 1 ? 's' : ''}{assets.length > 0 ? ` + ${assets.length} asset${assets.length !== 1 ? 's' : ''}` : ''} • 
          Price data from CoinGecko & Yahoo Finance
        </p>
        {(['5y', '10y', 'all'] as TimeRange[]).includes(timeRange) && (
          <p className="text-xs text-yellow-500 text-center mt-2">
            ⚠️ CoinGecko free API limits historical data to 365 days
          </p>
        )}
      </div>
    </div>
  )
}
