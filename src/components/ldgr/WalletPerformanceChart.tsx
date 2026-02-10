import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Calendar } from 'lucide-react'
import type { CryptoWallet, WalletBalance } from '../../lib/ldgr/cryptoWallets'

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
  const filteredWallets = wallets.filter(wallet => 
    filterBlockchain === 'all' || wallet.blockchain === filterBlockchain
  )

  useEffect(() => {
    generateChartData()
  }, [filteredWallets, balances, timeRange])

  const generateChartData = () => {
    setLoading(true)
    
    // Generate mock historical data based on current balances
    // In production, this would fetch real historical price data from an API
    const daysMap: Record<TimeRange, number> = {
      '1d': 1,
      '3d': 3,
      '1w': 7,
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '1y': 365,
      '5y': 1825,
      '10y': 3650,
      'all': 3650 // Default to 10 years for "all time"
    }
    const days = daysMap[timeRange]
    const data: any[] = []
    
    for (let i = days; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      const dataPoint: any = {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString()
      }
      
      // Add each wallet's balance for this date
      filteredWallets.forEach(wallet => {
        const balance = balances[wallet.address]
        if (balance?.usd_value) {
          // Generate mock historical data with some variance
          // In production, fetch real historical prices
          const usdValue = typeof balance.usd_value === 'number' ? balance.usd_value : parseFloat(balance.usd_value)
          const variance = (Math.random() - 0.5) * 0.3 // ±15% variance
          const historicalValue = usdValue * (1 + variance * (i / days))
          dataPoint[wallet.wallet_name] = parseFloat(historicalValue.toFixed(2))
        }
      })
      
      data.push(dataPoint)
    }
    
    setChartData(data)
    setLoading(false)
  }

  // Calculate total portfolio value
  const totalValue = filteredWallets.reduce((sum, wallet) => {
    const balance = balances[wallet.address]
    const value = typeof balance?.usd_value === 'number' ? balance.usd_value : parseFloat(balance?.usd_value || '0')
    return sum + value
  }, 0)

  // Calculate 24h change (mock data - would be real in production)
  const change24h = (Math.random() - 0.5) * 10 // Random ±5%
  const isPositive = change24h >= 0

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
            <h3 className="text-lg font-bold text-white">Portfolio Performance</h3>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl sm:text-3xl font-black text-white">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{change24h.toFixed(2)}% (24h)
            </span>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-samurai-steel hidden sm:block" />
          <div className="flex gap-1 bg-samurai-black-lighter rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-samurai-red text-white'
                    : 'text-samurai-steel hover:text-white hover:bg-samurai-grey-dark'
                }`}
              >
                {range}
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
                dot={false}
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Legend Info */}
      <div className="mt-4 pt-4 border-t border-samurai-grey-dark">
        <p className="text-xs text-samurai-steel text-center">
          Showing {filteredWallets.length} wallet{filteredWallets.length !== 1 ? 's' : ''} • 
          Historical data is simulated for demonstration
        </p>
      </div>
    </div>
  )
}
