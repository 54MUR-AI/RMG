import { useState, useEffect } from 'react'
import { X, Key, DollarSign } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getUserApiKeys } from '../../lib/ldgr/apiKeys'
import type { ApiKey } from '../../lib/ldgr/apiKeys'

interface LdgrSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function LdgrSettings({ isOpen, onClose }: LdgrSettingsProps) {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [selectedFinancialApi, setSelectedFinancialApi] = useState<string>(() => {
    return localStorage.getItem('ldgr_financial_api') || 'coingecko'
  })
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>(() => {
    return localStorage.getItem('ldgr_financial_api_key_id') || ''
  })

  useEffect(() => {
    if (isOpen && user) {
      loadApiKeys()
    }
  }, [isOpen, user])

  const loadApiKeys = async () => {
    if (!user) return
    try {
      const keys = await getUserApiKeys(user.id)
      setApiKeys(keys)
    } catch (error) {
      console.error('Error loading API keys:', error)
    }
  }

  const handleSave = () => {
    localStorage.setItem('ldgr_financial_api', selectedFinancialApi)
    localStorage.setItem('ldgr_financial_api_key_id', selectedApiKeyId)
    
    window.dispatchEvent(new CustomEvent('ldgr-settings-changed', {
      detail: { financialApi: selectedFinancialApi, apiKeyId: selectedApiKeyId }
    }))
    
    onClose()
  }

  const financialApis = [
    { 
      id: 'finnhub', 
      name: 'Finnhub', 
      description: 'Primary: Stocks + Crypto (requires API key)',
      badge: 'Premium'
    },
    { 
      id: 'alphavantage', 
      name: 'Alpha Vantage', 
      description: 'Primary: Stocks + Crypto + Forex (requires API key)',
      badge: 'Premium'
    },
    { 
      id: 'coingecko', 
      name: 'CoinGecko', 
      description: 'Fallback: Crypto only, always available (no API key needed)',
      badge: 'Default'
    }
  ]

  const financialApiKeys = apiKeys.filter(key => 
    ['Finnhub', 'Alpha Vantage', 'Other'].includes(key.service_name)
  )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-samurai-red/30">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-samurai-red" />
            <h2 className="text-2xl font-black text-white">LDGR Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-samurai-grey rounded-lg transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-samurai-red" />
              Financial Data Source
            </h3>
            <p className="text-sm text-white/70 mb-2">
              Choose your primary API for fetching prices
            </p>
            <p className="text-xs text-blue-400 mb-4">
              💡 CoinGecko is always used as fallback if primary API fails
            </p>

            <div className="space-y-3">
              {financialApis.map(api => (
                <label
                  key={api.id}
                  className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedFinancialApi === api.id
                      ? 'border-samurai-red bg-samurai-red/10'
                      : 'border-samurai-grey hover:border-samurai-red/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="financial-api"
                    value={api.id}
                    checked={selectedFinancialApi === api.id}
                    onChange={(e) => setSelectedFinancialApi(e.target.value)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{api.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        api.badge === 'Default' 
                          ? 'bg-blue-500/20 text-blue-400' 
                          : 'bg-samurai-red/20 text-samurai-red'
                      }`}>
                        {api.badge}
                      </span>
                    </div>
                    <div className="text-sm text-white/70 mt-1">{api.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {selectedFinancialApi !== 'coingecko' && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <Key className="w-5 h-5 text-samurai-red" />
                Select API Key
              </h3>
              <p className="text-sm text-white/70 mb-4">
                Choose a saved API key from your API Key Manager
              </p>

              {financialApiKeys.length > 0 ? (
                <select
                  value={selectedApiKeyId}
                  onChange={(e) => setSelectedApiKeyId(e.target.value)}
                  className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white focus:border-samurai-red focus:outline-none"
                >
                  <option value="">Select an API key...</option>
                  {financialApiKeys.map(key => (
                    <option key={key.id} value={key.id}>
                      {key.key_name} ({key.service_name})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-4 bg-samurai-black border-2 border-samurai-grey rounded-lg">
                  <p className="text-white/70 text-sm mb-2">
                    ⚠️ No API keys found. Add a {selectedFinancialApi === 'finnhub' ? 'Finnhub' : 'Alpha Vantage'} API key in the API Keys tab first.
                  </p>
                  <p className="text-blue-400 text-xs">
                    Will use CoinGecko fallback until API key is configured.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-samurai-red/30">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-samurai-grey hover:bg-samurai-grey-dark rounded-lg font-bold text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-samurai-red hover:bg-samurai-red-dark rounded-lg font-bold text-white transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
