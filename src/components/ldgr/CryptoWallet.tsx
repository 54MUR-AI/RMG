import { useState, useEffect } from 'react'
import { Wallet, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Check, TrendingUp, RefreshCw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface CryptoWallet {
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

interface WalletBalance {
  balance: string
  usd_value: string
  last_updated: string
}

const BLOCKCHAINS = {
  ethereum: { name: 'Ethereum', icon: '⟠', color: 'blue', symbol: 'ETH' },
  bitcoin: { name: 'Bitcoin', icon: '₿', color: 'orange', symbol: 'BTC' },
  solana: { name: 'Solana', icon: '◎', color: 'purple', symbol: 'SOL' },
  polygon: { name: 'Polygon', icon: '⬡', color: 'purple', symbol: 'MATIC' },
  binance: { name: 'Binance Smart Chain', icon: '🔶', color: 'yellow', symbol: 'BNB' },
  avalanche: { name: 'Avalanche', icon: '🔺', color: 'red', symbol: 'AVAX' },
  cardano: { name: 'Cardano', icon: '₳', color: 'blue', symbol: 'ADA' },
  other: { name: 'Other', icon: '🪙', color: 'gray', symbol: '' }
}

export default function CryptoWallet() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<CryptoWallet[]>([])
  const [balances, setBalances] = useState<Record<string, WalletBalance>>({})
  const [loading, setLoading] = useState(true)
  const [loadingBalances, setLoadingBalances] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [revealedSeeds] = useState<Set<string>>(new Set())
  const [copiedItem] = useState<string | null>(null)
  const [filterBlockchain, setFilterBlockchain] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      loadWallets()
    }
  }, [user])

  const loadWallets = async () => {
    // TODO: Implement actual API call
    setLoading(false)
    // Placeholder data
    setWallets([])
  }

  const loadWalletBalance = async (address: string, _blockchain: string) => {
    // TODO: Implement blockchain API integration
    // Use services like Etherscan, Blockchain.com, etc.
    setLoadingBalances(true)
    try {
      // Placeholder - would call actual blockchain API
      const mockBalance: WalletBalance = {
        balance: '0.00',
        usd_value: '$0.00',
        last_updated: new Date().toISOString()
      }
      setBalances(prev => ({ ...prev, [address]: mockBalance }))
    } finally {
      setLoadingBalances(false)
    }
  }

  const refreshAllBalances = async () => {
    setLoadingBalances(true)
    for (const wallet of wallets) {
      await loadWalletBalance(wallet.address, wallet.blockchain)
    }
  }

  const blockchains = ['all', ...Object.keys(BLOCKCHAINS)]
  
  const filteredWallets = wallets.filter(wallet => {
    const matchesBlockchain = filterBlockchain === 'all' || wallet.blockchain === filterBlockchain
    const matchesSearch = !searchQuery || 
      wallet.wallet_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesBlockchain && matchesSearch
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
        <p className="mt-4 text-white/70">Loading wallets...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-samurai-red" />
            Crypto Wallets
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Securely store seed phrases and track wallet balances across blockchains
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshAllBalances}
            disabled={loadingBalances || wallets.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-grey-dark text-white rounded-lg font-bold hover:bg-samurai-grey transition-all disabled:opacity-50"
            title="Refresh all balances"
          >
            <RefreshCw className={`w-4 h-4 ${loadingBalances ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => {
              setShowAddModal(true)
              alert('Crypto wallet management coming soon!')
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            Add Wallet
          </button>
          {showAddModal && null}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search wallets..."
          className="w-full px-4 py-3 pl-10 bg-samurai-grey-darker border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
        />
        <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
      </div>

      {/* Blockchain Filter */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {blockchains.map(blockchain => {
          const chain = blockchain === 'all' ? null : BLOCKCHAINS[blockchain as keyof typeof BLOCKCHAINS]
          return (
            <button
              key={blockchain}
              onClick={() => setFilterBlockchain(blockchain)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex-shrink-0 ${
                filterBlockchain === blockchain
                  ? 'bg-samurai-red text-white'
                  : 'bg-samurai-grey-dark text-white/70 hover:bg-samurai-grey'
              }`}
            >
              {chain ? `${chain.icon} ${chain.name}` : 'All'}
            </button>
          )
        })}
      </div>

      {/* Wallets List */}
      {filteredWallets.length === 0 ? (
        <div className="text-center py-12 bg-samurai-grey-darker rounded-lg border-2 border-samurai-grey">
          <Wallet className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No wallets yet</p>
          <p className="text-white/50 text-sm mt-2">Add your first crypto wallet to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredWallets.map(wallet => {
            const chain = BLOCKCHAINS[wallet.blockchain as keyof typeof BLOCKCHAINS]
            const isRevealed = revealedSeeds.has(wallet.id)
            const balance = balances[wallet.address]
            
            return (
              <div
                key={wallet.id}
                className="bg-samurai-grey-darker border-2 border-samurai-steel-dark rounded-lg p-4 hover:border-samurai-red/50 transition-all"
              >
                <div className="flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{chain.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-white truncate">{wallet.wallet_name}</h3>
                          <p className="text-sm text-white/60">{chain.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                      <button
                        className="p-2 rounded hover:bg-samurai-grey transition-colors"
                        title="Edit wallet"
                      >
                        <Edit2 className="w-4 h-4 text-white/70" />
                      </button>
                      
                      <button
                        className="p-2 rounded hover:bg-red-600 transition-colors"
                        title="Delete wallet"
                      >
                        <Trash2 className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  </div>

                  {/* Balance */}
                  {balance && (
                    <div className="bg-samurai-black rounded-lg p-4 border-2 border-samurai-grey">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/60 text-xs mb-1">Balance</p>
                          <p className="text-2xl font-bold text-white">{balance.balance} {chain.symbol}</p>
                          <p className="text-white/60 text-sm mt-1">{balance.usd_value}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/60 text-xs font-semibold">WALLET ADDRESS</p>
                      <button
                        className="p-1 rounded hover:bg-samurai-grey transition-colors"
                        title="Copy address"
                      >
                        {copiedItem === `addr-${wallet.id}` ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-white/70" />
                        )}
                      </button>
                    </div>
                    <code className="block px-3 py-2 bg-samurai-black rounded text-white/90 text-xs font-mono break-all">
                      {wallet.address}
                    </code>
                  </div>

                  {/* Seed Phrase */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white/60 text-xs font-semibold">SEED PHRASE</p>
                      <div className="flex gap-1">
                        <button
                          className="p-1 rounded hover:bg-samurai-grey transition-colors"
                          title={isRevealed ? 'Hide seed phrase' : 'Reveal seed phrase'}
                        >
                          {isRevealed ? (
                            <EyeOff className="w-3 h-3 text-white/70" />
                          ) : (
                            <Eye className="w-3 h-3 text-white/70" />
                          )}
                        </button>
                        <button
                          className="p-1 rounded hover:bg-samurai-grey transition-colors"
                          title="Copy seed phrase"
                        >
                          {copiedItem === `seed-${wallet.id}` ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-white/70" />
                          )}
                        </button>
                      </div>
                    </div>
                    <code className="block px-3 py-2 bg-samurai-black rounded text-white/90 text-xs font-mono break-all">
                      {isRevealed ? 'word1 word2 word3 ...' : '•••••••••••••••••••••••••••••••••••••••••••••••'}
                    </code>
                  </div>

                  {wallet.notes && (
                    <p className="text-white/50 text-xs">{wallet.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
