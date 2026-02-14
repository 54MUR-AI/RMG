import { useState, useEffect } from 'react'
import { Key, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Check, Power } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import FilterDropdown from './FilterDropdown'
import {
  getUserApiKeys,
  addApiKey,
  updateApiKey,
  deleteApiKey,
  toggleApiKeyStatus,
  decryptApiKey,
  API_SERVICES,
  type ApiKey,
  type ApiKeyInput
} from '../../lib/ldgr/apiKeys'
import { secureCopy } from '../../lib/ldgr/secureClipboard'
import { useAutoLock } from '../../hooks/useAutoLock'

export default function ApiKeyManager() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useAutoLock(() => {
    setRevealedKeys(new Set())
    setCopiedKey(null)
  })

  useEffect(() => {
    if (user) {
      loadApiKeys()
    }
  }, [user])

  const loadApiKeys = async () => {
    if (!user) return
    try {
      setLoading(true)
      const keys = await getUserApiKeys(user.id)
      setApiKeys(keys)
    } catch (error) {
      console.error('Error loading API keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddKey = async (input: ApiKeyInput) => {
    if (!user) return
    try {
      await addApiKey(user.id, user.email || '', input)
      await loadApiKeys()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding API key:', error)
      alert('Failed to add API key. Please try again.')
    }
  }

  const handleUpdateKey = async (keyId: string, updates: Partial<ApiKeyInput>) => {
    if (!user) return
    try {
      await updateApiKey(keyId, user.id, updates)
      await loadApiKeys()
      setEditingKey(null)
    } catch (error) {
      console.error('Error updating API key:', error)
      alert('Failed to update API key. Please try again.')
    }
  }

  const handleDeleteKey = async (keyId: string, keyName: string) => {
    if (!confirm(`Delete API key "${keyName}"?`)) return
    try {
      await deleteApiKey(keyId)
      await loadApiKeys()
    } catch (error) {
      console.error('Error deleting API key:', error)
      alert('Failed to delete API key. Please try again.')
    }
  }

  const handleToggleStatus = async (keyId: string, currentStatus: boolean) => {
    try {
      await toggleApiKeyStatus(keyId, !currentStatus)
      await loadApiKeys()
    } catch (error) {
      console.error('Error toggling API key status:', error)
      alert('Failed to toggle API key status. Please try again.')
    }
  }

  const handleRevealKey = async (key: ApiKey) => {
    if (!user?.email) return
    if (revealedKeys.has(key.id)) {
      setRevealedKeys(prev => {
        const next = new Set(prev)
        next.delete(key.id)
        return next
      })
    } else {
      setRevealedKeys(prev => new Set(prev).add(key.id))
    }
  }

  const handleCopyKey = async (key: ApiKey) => {
    if (!user) return
    try {
      const decrypted = await decryptApiKey(key.encrypted_key, user.email || '', user.id)
      await secureCopy(decrypted)
      setCopiedKey(key.id)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error('Error copying key:', error)
      alert('Failed to copy key. Please try again.')
    }
  }
  
  const filteredKeys = apiKeys.filter(key => {
    const service = API_SERVICES[key.service_name as keyof typeof API_SERVICES]
    const matchesCategory = filterCategory === 'all' || service?.category === filterCategory
    const matchesSearch = !searchQuery || 
      key.key_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service?.name && service.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
        <p className="mt-4 text-white/70">Loading API keys...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-samurai-red" />
            API Keys
          </h2>
          <p className="text-white/70 text-sm mt-1 hidden sm:block">
            Securely store and manage API keys for use across RMG applications
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Key
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search API keys..."
          className="w-full px-4 py-3 pl-10 bg-samurai-grey-darker border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
        />
        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
      </div>

      {/* Category Filter */}
      <FilterDropdown
        label="Filter by Service Type"
        value={filterCategory}
        onChange={setFilterCategory}
        options={[
          { value: 'all', label: 'All Services' },
          ...Array.from(new Set(Object.values(API_SERVICES).map(s => s.category))).map(cat => ({
            value: cat,
            label: cat
          }))
        ]}
      />

      {/* API Keys List */}
      {filteredKeys.length === 0 ? (
        <div className="text-center py-12 bg-samurai-grey-darker rounded-lg border-2 border-samurai-grey">
          <Key className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No API keys yet</p>
          <p className="text-white/50 text-sm mt-2">Add your first API key to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredKeys.map(key => {
            const service = API_SERVICES[key.service_name as keyof typeof API_SERVICES]
            const isRevealed = revealedKeys.has(key.id)
            
            return (
              <div
                key={key.id}
                className={`bg-samurai-grey-darker border-2 rounded-lg p-4 transition-all ${
                  key.is_active ? 'border-samurai-steel-dark' : 'border-samurai-grey opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{service?.icon || '🔧'}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{key.key_name}</h3>
                        <p className="text-sm text-white/60">{service?.name || key.service_name}</p>
                      </div>
                      {!key.is_active && (
                        <span className="px-2 py-0.5 bg-samurai-grey text-white/70 text-xs rounded">
                          Disabled
                        </span>
                      )}
                    </div>
                    
                    {key.description && (
                      <p className="text-white/70 text-sm mb-3">{key.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 px-3 py-2 bg-samurai-black rounded text-white/90 text-sm font-mono break-all">
                        {isRevealed ? (
                          <KeyDisplay keyData={key} userEmail={user?.email || ''} userId={user?.id || ''} />
                        ) : (
                          '••••••••••••••••••••••••••••••••'
                        )}
                      </code>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span>Added {new Date(key.created_at).toLocaleDateString()}</span>
                      {key.last_used_at && (
                        <>
                          <span>•</span>
                          <span>Last used {new Date(key.last_used_at).toLocaleDateString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRevealKey(key)}
                      className="p-2 rounded hover:bg-samurai-grey transition-colors"
                      title={isRevealed ? 'Hide key' : 'Reveal key'}
                    >
                      {isRevealed ? (
                        <EyeOff className="w-4 h-4 text-white/70" />
                      ) : (
                        <Eye className="w-4 h-4 text-white/70" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleCopyKey(key)}
                      className="p-2 rounded hover:bg-samurai-grey transition-colors"
                      title="Copy key"
                    >
                      {copiedKey === key.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/70" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleToggleStatus(key.id, key.is_active)}
                      className="p-2 rounded hover:bg-samurai-grey transition-colors"
                      title={key.is_active ? 'Disable key' : 'Enable key'}
                    >
                      <Power className={`w-4 h-4 ${key.is_active ? 'text-green-500' : 'text-white/30'}`} />
                    </button>
                    
                    <button
                      onClick={() => setEditingKey(key)}
                      className="p-2 rounded hover:bg-samurai-grey transition-colors"
                      title="Edit key"
                    >
                      <Edit2 className="w-4 h-4 text-white/70" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteKey(key.id, key.key_name)}
                      className="p-2 rounded hover:bg-red-600 transition-colors"
                      title="Delete key"
                    >
                      <Trash2 className="w-4 h-4 text-white/70" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || editingKey) && (
        <ApiKeyModal
          existingKey={editingKey}
          onSave={editingKey ? 
            (input) => handleUpdateKey(editingKey.id, input) : 
            handleAddKey
          }
          onClose={() => {
            setShowAddModal(false)
            setEditingKey(null)
          }}
        />
      )}
    </div>
  )
}

// Component to display decrypted key
function KeyDisplay({ keyData, userEmail, userId }: { keyData: ApiKey; userEmail: string; userId: string }) {
  const [decrypted, setDecrypted] = useState<string>('Loading...')
  
  useEffect(() => {
    decryptApiKey(keyData.encrypted_key, userEmail, userId)
      .then(setDecrypted)
      .catch(() => setDecrypted('Error decrypting'))
  }, [keyData.encrypted_key, userEmail, userId])
  
  return <>{decrypted}</>
}

// Modal for adding/editing API keys
function ApiKeyModal({
  existingKey,
  onSave,
  onClose
}: {
  existingKey: ApiKey | null
  onSave: (input: ApiKeyInput) => Promise<void>
  onClose: () => void
}) {
  const [serviceName, setServiceName] = useState(existingKey?.service_name || '')
  const [keyName, setKeyName] = useState(existingKey?.key_name || '')
  const [apiKey, setApiKey] = useState('')
  const [description, setDescription] = useState(existingKey?.description || '')
  const [saving, setSaving] = useState(false)
  const [serviceSearch, setServiceSearch] = useState('')
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceName || !keyName || (!apiKey && !existingKey)) return
    
    try {
      setSaving(true)
      await onSave({
        service_name: serviceName,
        key_name: keyName,
        api_key: apiKey,
        description
      })
    } finally {
      setSaving(false)
    }
  }

  const filteredServices = Object.entries(API_SERVICES).filter(([key, service]) => {
    if (!serviceSearch) return true
    const q = serviceSearch.toLowerCase()
    return key.toLowerCase().includes(q) ||
      service.name.toLowerCase().includes(q) ||
      service.category.toLowerCase().includes(q)
  })

  // Group filtered services by category
  const groupedServices = filteredServices.reduce<Record<string, [string, typeof API_SERVICES[keyof typeof API_SERVICES]][]>>((acc, entry) => {
    const cat = entry[1].category
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(entry)
    return acc
  }, {})

  const selectedService = serviceName ? API_SERVICES[serviceName as keyof typeof API_SERVICES] : null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-black text-white mb-6">
          {existingKey ? 'Edit API Key' : 'Add API Key'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Searchable Service Selector */}
          <div>
            <label className="block text-white font-semibold mb-2">Service</label>
            {existingKey ? (
              <div className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white/70">
                {selectedService ? `${selectedService.icon} ${selectedService.name}` : serviceName}
              </div>
            ) : (
              <div className="relative">
                {/* Selected service display / search input */}
                <div
                  className={`w-full px-4 py-3 bg-samurai-black border-2 rounded-lg text-white cursor-pointer flex items-center gap-2 ${
                    serviceDropdownOpen ? 'border-samurai-red' : 'border-samurai-grey'
                  }`}
                  onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                >
                  {serviceName && selectedService ? (
                    <>
                      <span>{selectedService.icon}</span>
                      <span className="flex-1">{selectedService.name}</span>
                      <span className="text-xs text-white/50">{selectedService.category}</span>
                    </>
                  ) : (
                    <span className="text-white/50 flex-1">Select a service...</span>
                  )}
                  <svg className={`w-4 h-4 text-white/50 transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>

                {/* Dropdown */}
                {serviceDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-samurai-black border-2 border-samurai-red rounded-lg shadow-xl max-h-72 flex flex-col">
                    {/* Search input */}
                    <div className="p-2 border-b border-samurai-grey-dark">
                      <input
                        type="text"
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        placeholder="Search services..."
                        className="w-full px-3 py-2 bg-samurai-grey-darker border border-samurai-grey rounded text-white text-sm placeholder-white/40 focus:border-samurai-red focus:outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    {/* Results */}
                    <div className="overflow-y-auto flex-1">
                      {Object.keys(groupedServices).length === 0 ? (
                        <div className="px-4 py-3 text-white/50 text-sm text-center">No services match "{serviceSearch}"</div>
                      ) : (
                        Object.entries(groupedServices).map(([category, services]) => (
                          <div key={category}>
                            <div className="px-3 py-1.5 text-[10px] font-bold text-samurai-red uppercase tracking-wider bg-samurai-grey-darker/50 sticky top-0">
                              {category}
                            </div>
                            {services.map(([key, service]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setServiceName(key)
                                  setServiceDropdownOpen(false)
                                  setServiceSearch('')
                                }}
                                className={`w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-samurai-red/20 transition-colors text-sm ${
                                  serviceName === key ? 'bg-samurai-red/10 text-samurai-red' : 'text-white'
                                }`}
                              >
                                <span className="text-base">{service.icon}</span>
                                <span className="flex-1">{service.name}</span>
                              </button>
                            ))}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">Key Name</label>
            <input
              type="text"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="e.g., Production Key, Development Key"
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
              required
            />
            <p className="text-[10px] text-white/40 mt-1.5">
              For APIs that require a <span className="text-cyan-400/70">client ID</span> or <span className="text-cyan-400/70">username</span> (e.g. OpenSky), use the Key Name as your client ID and the API Key field for your secret/password.
            </p>
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">
              API Key {existingKey && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none font-mono"
              required={!existingKey}
            />
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this key..."
              rows={3}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none resize-none"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : existingKey ? 'Update Key' : 'Add Key'}
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
