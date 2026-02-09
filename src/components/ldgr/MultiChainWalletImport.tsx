import { useState } from 'react'
import { Wallet, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { importMultiChainWallet, validateSeedPhrase, type BlockchainDetectionResult } from '../../lib/ldgr/multiChainImport'
import { addWallet } from '../../lib/ldgr/cryptoWallets'
import { useAuth } from '../../contexts/AuthContext'

interface MultiChainWalletImportProps {
  onComplete: () => void
  onCancel: () => void
}

export default function MultiChainWalletImport({ onComplete, onCancel }: MultiChainWalletImportProps) {
  const { user } = useAuth()
  const [step, setStep] = useState<'input' | 'detecting' | 'review' | 'importing' | 'complete'>('input')
  const [walletName, setWalletName] = useState('')
  const [seedPhrase, setSeedPhrase] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [detectionResults, setDetectionResults] = useState<BlockchainDetectionResult[]>([])
  const [selectedChains, setSelectedChains] = useState<Set<string>>(new Set())
  const [totalValue, setTotalValue] = useState('0')

  const handleDetect = async () => {
    if (!walletName.trim()) {
      setError('Please enter a wallet name')
      return
    }

    const validation = validateSeedPhrase(seedPhrase)
    if (!validation.valid) {
      setError(validation.error || 'Invalid seed phrase')
      return
    }

    setError('')
    setStep('detecting')

    try {
      const result = await importMultiChainWallet(seedPhrase, walletName, notes)
      setDetectionResults(result.detectionResults)
      setTotalValue(result.totalValue)
      
      // Auto-select chains with activity
      const activeChainsSet = new Set(
        result.detectionResults
          .filter(r => r.hasActivity)
          .map(r => r.blockchain)
      )
      setSelectedChains(activeChainsSet)
      
      setStep('review')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to detect wallets')
      setStep('input')
    }
  }

  const handleImport = async () => {
    if (selectedChains.size === 0) {
      setError('Please select at least one blockchain to import')
      return
    }

    setError('')
    setStep('importing')

    try {
      const chainsToImport = detectionResults.filter(r => selectedChains.has(r.blockchain))
      
      for (const chain of chainsToImport) {
        await addWallet(
          user?.id || '',
          user?.email || '',
          {
            wallet_name: chainsToImport.length > 1 
              ? `${walletName} (${chain.blockchain})`
              : walletName,
            blockchain: chain.blockchain,
            address: chain.address,
            seed_phrase: seedPhrase,
            notes: notes || `Auto-detected. Balance: ${chain.balance}`
          }
        )
      }

      setStep('complete')
      setTimeout(() => {
        onComplete()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import wallets')
      setStep('review')
    }
  }

  const toggleChain = (blockchain: string) => {
    const newSelected = new Set(selectedChains)
    if (newSelected.has(blockchain)) {
      newSelected.delete(blockchain)
    } else {
      newSelected.add(blockchain)
    }
    setSelectedChains(newSelected)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-samurai-grey-darker rounded-lg border-2 border-samurai-red max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-samurai-red/30">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-samurai-red" />
            <h2 className="text-xl font-bold text-white">Import Multi-Chain Wallet</h2>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            Enter your seed phrase once and we'll detect all blockchains with activity
          </p>
        </div>

        <div className="p-6">
          {step === 'input' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Name
                </label>
                <input
                  type="text"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="My Crypto Wallet"
                  className="w-full px-4 py-2 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-samurai-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Seed Phrase (12-24 words)
                </label>
                <textarea
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  placeholder="word1 word2 word3 ..."
                  rows={4}
                  className="w-full px-4 py-2 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-samurai-red font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your seed phrase is encrypted and never leaves your device
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Hardware wallet, Exchange, etc."
                  className="w-full px-4 py-2 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-samurai-red"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'detecting' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-samurai-red animate-spin mb-4" />
              <p className="text-white font-medium">Detecting blockchains...</p>
              <p className="text-sm text-gray-400 mt-2">Checking balances across multiple chains</p>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <div className="bg-samurai-red/10 border border-samurai-red/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Portfolio Value</p>
                    <p className="text-2xl font-bold text-white">${totalValue}</p>
                  </div>
                  <Wallet className="w-8 h-8 text-samurai-red" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-3">
                  Select blockchains to import ({selectedChains.size} selected)
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {detectionResults.map((result) => (
                    <div
                      key={result.blockchain}
                      onClick={() => toggleChain(result.blockchain)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedChains.has(result.blockchain)
                          ? 'bg-samurai-red/10 border-samurai-red'
                          : 'bg-samurai-grey-darker border-samurai-grey hover:border-samurai-red/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white">{result.blockchain}</p>
                            {result.hasActivity ? (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 font-mono mt-1">
                            {result.address.slice(0, 12)}...{result.address.slice(-8)}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <div>
                              <p className="text-xs text-gray-400">Balance</p>
                              <p className="text-sm text-white">{result.balance}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">USD Value</p>
                              <p className="text-sm text-white">{result.usd_value}</p>
                            </div>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedChains.has(result.blockchain)}
                          onChange={() => toggleChain(result.blockchain)}
                          className="w-5 h-5 rounded border-samurai-grey text-samurai-red focus:ring-samurai-red"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}

          {step === 'importing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-samurai-red animate-spin mb-4" />
              <p className="text-white font-medium">Importing wallets...</p>
              <p className="text-sm text-gray-400 mt-2">Creating {selectedChains.size} wallet entries</p>
            </div>
          )}

          {step === 'complete' && (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-400 mb-4" />
              <p className="text-xl font-semibold text-white">Import Complete!</p>
              <p className="text-sm text-gray-400 mt-2">
                Successfully imported {selectedChains.size} wallet{selectedChains.size !== 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-800 flex gap-3">
          {step === 'input' && (
            <>
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-samurai-grey-dark text-white rounded-lg font-bold hover:bg-samurai-grey transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDetect}
                className="flex-1 px-4 py-2 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-colors"
              >
                Detect Blockchains
              </button>
            </>
          )}

          {step === 'review' && (
            <>
              <button
                onClick={() => setStep('input')}
                className="flex-1 px-4 py-2 bg-samurai-grey-dark text-white rounded-lg font-bold hover:bg-samurai-grey transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleImport}
                disabled={selectedChains.size === 0}
                className="flex-1 px-4 py-2 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import {selectedChains.size} Wallet{selectedChains.size !== 1 ? 's' : ''}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
