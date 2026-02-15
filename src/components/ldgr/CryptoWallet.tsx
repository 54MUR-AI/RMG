import { useState, useEffect } from 'react'
import { Wallet, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Check, RefreshCw, TrendingUp, TrendingDown, Briefcase, BarChart3, Gem, Link2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import FilterDropdown from './FilterDropdown'
import MultiChainWalletImport from './MultiChainWalletImport'
import WalletPerformanceChart from './WalletPerformanceChart'
import { secureCopy } from '../../lib/ldgr/secureClipboard'
import { useAutoLock } from '../../hooks/useAutoLock'
import ReAuthGate from './ReAuthGate'
import StockAssets from './StockAssets'
import MetalAssets from './MetalAssets'
import {
  getUserWallets,
  addWallet,
  updateWallet,
  deleteWallet,
  decryptSeedPhrase,
  fetchWalletBalance,
  fetchWalletBalanceWithTokens,
  type CryptoWallet as CryptoWalletType,
  type CryptoWalletInput,
  type WalletBalance,
  type MultiTokenBalance
} from '../../lib/ldgr/cryptoWallets'
import { detectBlockchainFromAddress, getAddressFormatMessage } from '../../lib/ldgr/addressDetection'

type AssetSubTab = 'wallets' | 'stocks' | 'metals' | 'tokenized'

const BLOCKCHAINS = {
  ethereum: { name: 'Ethereum', icon: '⟠', color: 'blue', symbol: 'ETH' },
  bitcoin: { name: 'Bitcoin', icon: '₿', color: 'orange', symbol: 'BTC' },
  solana: { name: 'Solana', icon: '◎', color: 'purple', symbol: 'SOL' },
  polygon: { name: 'Polygon', icon: '⬡', color: 'purple', symbol: 'MATIC' },
  binance: { name: 'Binance Smart Chain', icon: '🔶', color: 'yellow', symbol: 'BNB' },
  avalanche: { name: 'Avalanche', icon: '🔺', color: 'red', symbol: 'AVAX' },
  cardano: { name: 'Cardano', icon: '₳', color: 'blue', symbol: 'ADA' },
  ripple: { name: 'Ripple', icon: '◈', color: 'blue', symbol: 'XRP' },
  cronos: { name: 'Cronos', icon: '🔷', color: 'blue', symbol: 'CRO' },
  other: { name: 'Other', icon: '🪙', color: 'gray', symbol: '' }
}

export default function CryptoWalletPage() {
  const [subTab, setSubTab] = useState<AssetSubTab>('wallets')

  const SUB_TABS: { key: AssetSubTab; label: string; icon: typeof Wallet }[] = [
    { key: 'wallets', label: 'Wallets', icon: Wallet },
    { key: 'stocks', label: 'Stocks', icon: BarChart3 },
    { key: 'metals', label: 'Metals', icon: Gem },
    { key: 'tokenized', label: 'Tokenized', icon: Link2 },
  ]

  return (
    <div className="space-y-6">
      {/* Assets Header */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
          <Briefcase className="w-6 h-6 text-samurai-red" />
          Assets
        </h2>
        <p className="text-white/70 text-sm mt-1">
          Manage crypto wallets, equities, metals, and tokenized assets
        </p>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex justify-center gap-1 bg-samurai-grey-darker rounded-lg p-1 border border-samurai-grey">
        {SUB_TABS.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setSubTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                subTab === t.key
                  ? 'bg-samurai-red text-white shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-samurai-grey-dark'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Sub-tab content */}
      {subTab === 'wallets' && <CryptoWalletSection />}
      {subTab === 'stocks' && <StockAssets />}
      {subTab === 'metals' && <MetalAssets />}
      {subTab === 'tokenized' && <TokenizedPlaceholder />}
    </div>
  )
}

// Tokenized assets placeholder
function TokenizedPlaceholder() {
  return (
    <div className="text-center py-16 bg-samurai-grey-darker rounded-lg border-2 border-samurai-grey">
      <Link2 className="w-16 h-16 text-samurai-red/30 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Tokenized Assets</h3>
      <p className="text-white/60 text-sm max-w-md mx-auto mb-4">
        Coming soon — register physical assets on-chain. Scan PSA graded cards,
        ANACS graded coins, and other certified collectibles to create verifiable
        digital tokens backed by real-world items.
      </p>
      <div className="flex flex-wrap justify-center gap-3 text-xs text-white/40">
        <span className="bg-samurai-grey px-3 py-1 rounded-full">PSA Graded Cards</span>
        <span className="bg-samurai-grey px-3 py-1 rounded-full">ANACS Graded Coins</span>
        <span className="bg-samurai-grey px-3 py-1 rounded-full">NGC Certified</span>
        <span className="bg-samurai-grey px-3 py-1 rounded-full">CGC Comics</span>
        <span className="bg-samurai-grey px-3 py-1 rounded-full">Fine Art</span>
      </div>
    </div>
  )
}

// ── Crypto Wallets Section (original CryptoWallet component) ──

function CryptoWalletSection() {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<CryptoWalletType[]>([])
  const [balances, setBalances] = useState<Record<string, WalletBalance | MultiTokenBalance>>({})
  const [loading, setLoading] = useState(true)
  const [loadingBalances, setLoadingBalances] = useState(false)
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showMultiChainImport, setShowMultiChainImport] = useState(false)
  const [editingWallet, setEditingWallet] = useState<CryptoWalletType | null>(null)
  const [revealedSeeds, setRevealedSeeds] = useState<Set<string>>(new Set())
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
  const [filterBlockchain, setFilterBlockchain] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pendingRevealId, setPendingRevealId] = useState<string | null>(null)

  useAutoLock(() => {
    setRevealedSeeds(new Set())
    setCopiedItem(null)
  })

  useEffect(() => {
    if (user) {
      loadWallets()
    }
  }, [user])

  const loadWallets = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await getUserWallets(user.id)
      setWallets(data)
      
      // Auto-load balances for all wallets
      if (data.length > 0) {
        setLoadingBalances(true)
        for (const wallet of data) {
          try {
            // Try multi-token balance first
            const multiBalance = await fetchWalletBalanceWithTokens(wallet.address, wallet.blockchain)
            if (multiBalance) {
              setBalances(prev => ({ ...prev, [wallet.address]: multiBalance }))
            } else {
              // Fallback to simple balance
              const balance = await fetchWalletBalance(wallet.address, wallet.blockchain)
              if (balance) {
                setBalances(prev => ({ ...prev, [wallet.address]: balance }))
              }
            }
          } catch (error) {
            console.error(`Error loading balance for ${wallet.wallet_name}:`, error)
          }
        }
        setLoadingBalances(false)
      }
    } catch (error) {
      console.error('Error loading wallets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWallet = async (input: CryptoWalletInput) => {
    if (!user) return
    try {
      await addWallet(user.id, user.email || '', input)
      await loadWallets()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding wallet:', error)
      alert('Failed to add wallet. Please try again.')
    }
  }

  const handleUpdateWallet = async (walletId: string, updates: Partial<CryptoWalletInput>) => {
    if (!user) return
    try {
      await updateWallet(walletId, user.id, updates)
      await loadWallets()
      setEditingWallet(null)
    } catch (error) {
      console.error('Error updating wallet:', error)
      alert('Failed to update wallet. Please try again.')
    }
  }

  const handleDeleteWallet = async (walletId: string, walletName: string) => {
    if (!confirm(`Delete wallet "${walletName}"?`)) return
    try {
      await deleteWallet(walletId)
      await loadWallets()
    } catch (error) {
      console.error('Error deleting wallet:', error)
      alert('Failed to delete wallet. Please try again.')
    }
  }

  const handleRevealSeed = (walletId: string) => {
    if (revealedSeeds.has(walletId)) {
      setRevealedSeeds(prev => {
        const next = new Set(prev)
        next.delete(walletId)
        return next
      })
    } else {
      setPendingRevealId(walletId)
    }
  }

  const confirmRevealSeed = () => {
    if (pendingRevealId) {
      setRevealedSeeds(prev => new Set(prev).add(pendingRevealId))
      setPendingRevealId(null)
    }
  }

  const handleCopySeed = async (wallet: CryptoWalletType) => {
    if (!user) return
    if (!wallet.encrypted_seed_phrase) {
      alert('No seed phrase stored for this wallet')
      return
    }
    try {
      const decrypted = await decryptSeedPhrase(wallet.encrypted_seed_phrase, user.email || '', user.id)
      await secureCopy(decrypted)
      setCopiedItem(`seed-${wallet.id}`)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error('Error copying seed phrase:', error)
      alert('Failed to copy seed phrase. Please try again.')
    }
  }

  const handleCopyAddress = async (address: string, walletId: string) => {
    try {
      await navigator.clipboard.writeText(address)
      setCopiedItem(`address-${walletId}`)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (error) {
      console.error('Error copying address:', error)
    }
  }

  // Helper to check if balance is MultiTokenBalance
  const isMultiTokenBalance = (balance: WalletBalance | MultiTokenBalance): balance is MultiTokenBalance => {
    return 'native_token' in balance && 'tokens' in balance
  }

  // Toggle token list expansion
  const toggleTokenExpansion = (walletId: string) => {
    setExpandedTokens(prev => {
      const next = new Set(prev)
      if (next.has(walletId)) {
        next.delete(walletId)
      } else {
        next.add(walletId)
      }
      return next
    })
  }

  const loadWalletBalance = async (address: string, blockchain: string) => {
    setLoadingBalances(true)
    try {
      // Try to fetch multi-token balance first
      const multiBalance = await fetchWalletBalanceWithTokens(address, blockchain)
      if (multiBalance) {
        setBalances(prev => ({ ...prev, [address]: multiBalance }))
      } else {
        // Fallback to simple balance if multi-token fails
        const balance = await fetchWalletBalance(address, blockchain)
        if (balance) {
          setBalances(prev => ({ ...prev, [address]: balance }))
        }
      }
    } catch (error) {
      console.error('Error loading balance:', error)
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
          <p className="text-white/70 text-sm mt-1 hidden sm:block">
            Securely store seed phrases and track wallet balances across blockchains
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshAllBalances}
            disabled={loadingBalances || wallets.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-grey-dark text-white rounded-lg font-bold hover:bg-samurai-grey transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingBalances ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          {/* TODO: Re-enable when proper crypto libraries are integrated for address derivation
          <button
            onClick={() => setShowMultiChainImport(true)}
            className="flex items-center gap-2 px-4 py-2 bg-samurai-grey-dark text-white rounded-lg hover:bg-samurai-grey transition-colors"
          >
            <Scan className="w-4 h-4" />
            Import from Seed
          </button>
          */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            Add Wallet
          </button>
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
      <FilterDropdown
        label="Filter by Blockchain"
        value={filterBlockchain}
        onChange={setFilterBlockchain}
        options={[
          { value: 'all', label: 'All Blockchains' },
          ...Object.entries(BLOCKCHAINS).map(([key, chain]) => ({
            value: key,
            label: chain.name,
            icon: chain.icon
          }))
        ]}
      />

      {/* Performance Chart */}
      <WalletPerformanceChart 
        wallets={wallets}
        balances={balances}
        filterBlockchain={filterBlockchain}
      />

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
            const chain = BLOCKCHAINS[wallet.blockchain as keyof typeof BLOCKCHAINS] || BLOCKCHAINS.other
            const isRevealed = revealedSeeds.has(wallet.id)
            const balance = balances[wallet.address]
            
            return (
              <div
                key={wallet.id}
                className="bg-samurai-grey-darker border-2 border-samurai-steel-dark rounded-lg p-3 sm:p-4 hover:border-samurai-red/50 transition-all"
              >
                <div className="flex flex-col gap-3 sm:gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl sm:text-2xl">{chain.icon}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold text-white truncate">{wallet.wallet_name}</h3>
                          <p className="text-xs sm:text-sm text-white/60">{chain.name === 'Other' ? wallet.blockchain : chain.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => loadWalletBalance(wallet.address, wallet.blockchain)}
                        className="p-1.5 rounded hover:bg-samurai-grey transition-colors"
                        title="Refresh balance"
                      >
                        <RefreshCw className={`w-4 h-4 text-white/70 ${loadingBalances ? 'animate-spin' : ''}`} />
                      </button>
                      
                      <button
                        onClick={() => setEditingWallet(wallet)}
                        className="p-1.5 rounded hover:bg-samurai-grey transition-colors"
                        title="Edit wallet"
                      >
                        <Edit2 className="w-4 h-4 text-white/70" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteWallet(wallet.id, wallet.wallet_name)}
                        className="p-1.5 rounded hover:bg-red-600 transition-colors"
                        title="Delete wallet"
                      >
                        <Trash2 className="w-4 h-4 text-white/70" />
                      </button>
                    </div>
                  </div>

                  {/* Balance */}
                  {balance && (
                    <div className="bg-samurai-black rounded-lg p-3 sm:p-4 border-2 border-samurai-grey">
                      {isMultiTokenBalance(balance) ? (
                        // Multi-token balance display
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-white/60 text-xs mb-1">Total Portfolio Value</p>
                              <p className="text-xl sm:text-2xl font-bold text-white">{balance.total_usd_value}</p>
                              <p className="text-white/60 text-xs mt-1">
                                {balance.native_token.balance} {balance.native_token.symbol}
                                {balance.tokens.length > 0 && ` + ${balance.tokens.length} token${balance.tokens.length !== 1 ? 's' : ''}`}
                              </p>
                            </div>
                            {(() => {
                              // TODO: Replace with actual 24h change from balance.change_24h when available
                              const change24h = 0 // Placeholder: balance.change_24h || 0
                              const isPositive = change24h >= 0
                              return isPositive ? (
                                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                              ) : (
                                <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                              )
                            })()}
                          </div>
                          
                          {/* Token list toggle */}
                          {balance.tokens.length > 0 && (
                            <button
                              onClick={() => toggleTokenExpansion(wallet.id)}
                              className="w-full text-left text-xs text-samurai-red hover:text-samurai-red-dark transition-colors font-semibold"
                            >
                              {expandedTokens.has(wallet.id) ? '▼ Hide tokens' : `▶ Show ${balance.tokens.length} token${balance.tokens.length !== 1 ? 's' : ''}`}
                            </button>
                          )}
                          
                          {/* Expanded token list */}
                          {expandedTokens.has(wallet.id) && balance.tokens.length > 0 && (
                            <div className="space-y-2 pt-2 border-t border-samurai-grey">
                              {balance.tokens.map((token, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <div>
                                    <span className="text-white font-semibold">{token.symbol}</span>
                                    <span className="text-white/50 ml-2">{token.balance}</span>
                                  </div>
                                  <span className="text-white/70">{token.usd_value}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Simple balance display
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-xs mb-1">Balance</p>
                            <p className="text-xl sm:text-2xl font-bold text-white">{balance.balance} {chain.symbol || wallet.blockchain}</p>
                            <p className="text-white/60 text-xs sm:text-sm mt-1">{balance.usd_value}</p>
                          </div>
                          {(() => {
                            // TODO: Replace with actual 24h change from balance.change_24h when available
                            const change24h = 0 // Placeholder: balance.change_24h || 0
                            const isPositive = change24h >= 0
                            return isPositive ? (
                              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                            ) : (
                              <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  <div>
                    <div className="flex items-center justify-between mb-1 sm:mb-2">
                      <p className="text-white/60 text-xs font-semibold">WALLET ADDRESS</p>
                      <button
                        onClick={() => handleCopyAddress(wallet.address, wallet.id)}
                        className="p-1 rounded hover:bg-samurai-grey transition-colors"
                        title="Copy address"
                      >
                        {copiedItem === `address-${wallet.id}` ? (
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

                  {/* Seed Phrase - Only show if seed phrase exists */}
                  {wallet.encrypted_seed_phrase && (
                    <div>
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <p className="text-white/60 text-xs font-semibold">SEED PHRASE</p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleRevealSeed(wallet.id)}
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
                            onClick={() => handleCopySeed(wallet)}
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
                        {isRevealed ? (
                          <SeedPhraseDisplay wallet={wallet} userEmail={user?.email || ''} userId={user?.id || ''} />
                        ) : (
                          '•••••••••••••••••••••••••••••••••••••••••••••••'
                        )}
                      </code>
                    </div>
                  )}

                  {wallet.notes && (
                    <p className="text-white/50 text-xs">{wallet.notes}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingWallet) && (
        <WalletModal
          existingWallet={editingWallet}
          onSave={editingWallet ? 
            (input) => handleUpdateWallet(editingWallet.id, input) : 
            handleAddWallet
          }
          onClose={() => {
            setShowAddModal(false)
            setEditingWallet(null)
          }}
        />
      )}

      {/* Re-Auth Gate for Seed Phrase Reveal */}
      {pendingRevealId && (
        <ReAuthGate
          title="Reveal Seed Phrase"
          message="Seed phrases grant full access to your wallet funds. Make sure no one can see your screen before revealing."
          onConfirm={confirmRevealSeed}
          onCancel={() => setPendingRevealId(null)}
        />
      )}

      {/* Multi-Chain Import Modal */}
      {showMultiChainImport && (
        <MultiChainWalletImport
          onComplete={() => {
            setShowMultiChainImport(false)
            loadWallets()
          }}
          onCancel={() => setShowMultiChainImport(false)}
        />
      )}
    </div>
  )
}

// Component to display decrypted seed phrase
function SeedPhraseDisplay({ wallet, userEmail, userId }: { wallet: CryptoWalletType; userEmail: string; userId: string }) {
  const [decrypted, setDecrypted] = useState<string>('Loading...')
  
  useEffect(() => {
    if (!wallet.encrypted_seed_phrase) {
      setDecrypted('No seed phrase stored')
      return
    }
    decryptSeedPhrase(wallet.encrypted_seed_phrase, userEmail, userId)
      .then(setDecrypted)
      .catch(() => setDecrypted('Error decrypting'))
  }, [wallet.encrypted_seed_phrase, userEmail, userId])
  
  return <>{decrypted}</>
}

// Modal for adding/editing wallets
function WalletModal({
  existingWallet,
  onSave,
  onClose
}: {
  existingWallet: CryptoWalletType | null
  onSave: (input: CryptoWalletInput) => Promise<void>
  onClose: () => void
}) {
  const [walletName, setWalletName] = useState(existingWallet?.wallet_name || '')
  const [blockchain, setBlockchain] = useState(existingWallet?.blockchain || 'ethereum')
  const [address, setAddress] = useState(existingWallet?.address || '')
  const [seedPhrase, setSeedPhrase] = useState('')
  const [notes, setNotes] = useState(existingWallet?.notes || '')
  const [saving, setSaving] = useState(false)
  const [detectedBlockchains, setDetectedBlockchains] = useState<string[]>([])
  const [addressFormatMessage, setAddressFormatMessage] = useState('')
  const [validationError, setValidationError] = useState('')

  // Auto-detect blockchain when address changes
  const handleAddressChange = (newAddress: string) => {
    setAddress(newAddress)
    setValidationError('')
    
    if (newAddress.trim().length === 0) {
      setDetectedBlockchains([])
      setAddressFormatMessage('')
      return
    }

    const detection = detectBlockchainFromAddress(newAddress)
    setDetectedBlockchains(detection.detectedBlockchains)
    setAddressFormatMessage(getAddressFormatMessage(newAddress))

    // Auto-select blockchain if only one detected
    if (detection.detectedBlockchains.length === 1 && !existingWallet) {
      setBlockchain(detection.detectedBlockchains[0])
    }
  }

  // Validate blockchain selection matches address format
  const handleBlockchainChange = (newBlockchain: string) => {
    setBlockchain(newBlockchain)
    
    if (address.trim().length > 0 && detectedBlockchains.length > 0) {
      if (!detectedBlockchains.includes(newBlockchain)) {
        setValidationError(`Warning: Address format doesn't match ${newBlockchain}`)
      } else {
        setValidationError('')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletName || !blockchain || !address) return
    
    try {
      setSaving(true)
      await onSave({
        wallet_name: walletName,
        blockchain,
        address,
        seed_phrase: seedPhrase,
        notes
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-black text-white mb-6">
          {existingWallet ? 'Edit Wallet' : 'Add Wallet'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">Wallet Name</label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="e.g., My Main Wallet, Trading Wallet"
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">
              Blockchain
              {detectedBlockchains.length > 0 && detectedBlockchains.length < Object.keys(BLOCKCHAINS).length && (
                <span className="text-xs text-white/60 ml-2">(filtered by address format)</span>
              )}
            </label>
            <select
              value={blockchain}
              onChange={(e) => handleBlockchainChange(e.target.value)}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white focus:border-samurai-red focus:outline-none"
              required
            >
              {Object.entries(BLOCKCHAINS)
                .filter(([key]) => 
                  detectedBlockchains.length === 0 || 
                  detectedBlockchains.includes(key) ||
                  key === 'other'
                )
                .map(([key, chain]) => (
                  <option key={key} value={key}>
                    {chain.icon} {chain.name}
                  </option>
                ))}
            </select>
            {validationError && (
              <p className="text-xs text-yellow-500 mt-1">
                ⚠️ {validationError}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">Wallet Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => handleAddressChange(e.target.value)}
              placeholder="0x... or blockchain address"
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none font-mono text-sm"
              required
            />
            {addressFormatMessage && (
              <p className="text-xs text-samurai-red mt-1">
                {addressFormatMessage}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">
              Seed Phrase (optional) {existingWallet && '- leave blank to keep current'}
            </label>
            <textarea
              value={seedPhrase}
              onChange={(e) => setSeedPhrase(e.target.value)}
              placeholder="word1 word2 word3 ..."
              rows={3}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none resize-none font-mono text-sm"
            />
            <p className="text-xs text-white/50 mt-1">⚠️ Never share your seed phrase with anyone!</p>
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : existingWallet ? 'Update Wallet' : 'Add Wallet'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-samurai-grey text-white rounded-lg font-bold hover:bg-samurai-grey-dark transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
