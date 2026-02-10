import { useState, useEffect, useMemo, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import type { CryptoWallet, WalletBalance } from '../../lib/ldgr/cryptoWallets'
import { fetchWalletPortfolioHistory } from '../../lib/ldgr/cryptoPrices'

interface WalletPerformanceChartProps {
  wallets: CryptoWallet[]
  balances: Record<string, WalletBalance>
  filterBlockchain: string
}

const BLOCKCHAIN_COLORS: Record<string, string> = {
  ethereum: '#627EEA',
  bitcoin: '#F7931A',
  solana: '#9945FF',
  polygon: '#8247E5',
  binance: '#F3BA2F',
  avalanche: '#E84142',
  cardano: '#0033AD',
  ripple: '#23292F',
  other: '#6B7280'
}

type TimeRange = '1d' | '3d' | '1w' | '1m' | '3m' | '6m' | '1y' | '5y' | '10y' | 'all'

export default function WalletPerformanceChart({ wallets, balances, filterBlockchain }: WalletPerformanceChartProps) {
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

  const generateChartData = useCallback(async () => {
    setLoading(true)
    
    try {
      // Prepare wallet data for API call
      const walletsWithBalances = filteredWallets
        .map(wallet => {
          const balance = balances[wallet.address]
          console.log(`📊 Checking wallet ${wallet.wallet_name}:`, {
            address: wallet.address,
            hasBalance: !!balance,
            balanceData: balance
          })
          if (!balance?.balance) return null
          
          // Parse balance to get token amount
          const tokenAmount = typeof balance.balance === 'number' 
            ? balance.balance 
            : parseFloat(balance.balance)
          
          if (isNaN(tokenAmount) || tokenAmount <= 0) return null
          
          return {
            wallet_name: wallet.wallet_name,
            blockchain: wallet.blockchain,
            balance: tokenAmount,
            address: wallet.address
          }
        })
        .filter((w): w is NonNullable<typeof w> => w !== null)
      
      if (walletsWithBalances.length === 0) {
        console.log('📊 No wallets with valid balances to chart')
        setChartData([])
        setLoading(false)
        return
      }
      
      console.log('📊 Fetching historical data for wallets:', walletsWithBalances)
      
      // Fetch real historical price data from CoinGecko
      const data = await fetchWalletPortfolioHistory(walletsWithBalances, timeRange)
      
      console.log('📊 Chart data generated:', {
        wallets: walletsWithBalances.map(w => w.wallet_name),
        dataPoints: data.length,
        sampleData: data[0],
        lastData: data[data.length - 1]
      })
      
      setChartData(data)
    } catch (error) {
      console.error('📊 Error fetching chart data:', error)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }, [filteredWallets, balances, timeRange])

  useEffect(() => {
    generateChartData()
  }, [generateChartData])

  // Calculate total portfolio value
  const totalValue = useMemo(() => 
    filteredWallets.reduce((sum, wallet) => {
      const balance = balances[wallet.address]
      const value = typeof balance?.usd_value === 'number' ? balance.usd_value : parseFloat(balance?.usd_value || '0')
      return sum + value
    }, 0),
    [filteredWallets, balances]
  )

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
    
    filteredWallets.forEach(wallet => {
      const walletName = wallet.wallet_name
      if (firstPoint[walletName]) startValue += Number(firstPoint[walletName])
      if (lastPoint[walletName]) endValue += Number(lastPoint[walletName])
    })
    
    // Calculate percentage change
    const change = startValue > 0 ? ((endValue - startValue) / startValue) * 100 : 0
    
    return {
      changePercent: change,
      isPositive: change >= 0,
      periodLabel: timeRange.toUpperCase()
    }
  }, [chartData, filteredWallets, timeRange])

  if (filteredWallets.length === 0) {
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
              contentStyle={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #E63946',
                borderRadius: '8px',
                color: '#FFFFFF'
              }}
              formatter={(value: number | undefined) => {
                if (value === undefined) return ['N/A', '']
                return [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, '']
              }}
              labelStyle={{ color: '#9CA3AF' }}
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
                dot={{ r: 3, fill: BLOCKCHAIN_COLORS[wallet.blockchain] || '#6B7280' }}
                activeDot={{ r: 5 }}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend Info */}
      <div className="mt-4 pt-4 border-t border-samurai-grey-dark">
        <p className="text-xs text-samurai-steel text-center">
          Showing {filteredWallets.length} wallet{filteredWallets.length !== 1 ? 's' : ''} • 
          Historical data simulated based on current market prices
        </p>
      </div>
    </div>
  )
}
