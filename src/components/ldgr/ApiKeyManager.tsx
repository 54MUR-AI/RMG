import { useState, useEffect } from 'react'
import { Key, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Check, Power } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
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

export default function ApiKeyManager() {
  const { user } = useAuth()
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null)
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set())
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

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
    if (!user?.email) return
    try {
      await addApiKey(user.id, user.email, input)
      await loadApiKeys()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding API key:', error)
      alert('Failed to add API key. Please try again.')
    }
  }

  const handleUpdateKey = async (keyId: string, updates: Partial<ApiKeyInput>) => {
    if (!user?.email) return
    try {
      await updateApiKey(keyId, user.email, updates)
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
    if (!user?.email) return
    try {
      const decrypted = await decryptApiKey(key.encrypted_key, user.email)
      await navigator.clipboard.writeText(decrypted)
      setCopiedKey(key.id)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (error) {
      console.error('Error copying key:', error)
      alert('Failed to copy key. Please try again.')
    }
  }

  const categories = ['all', ...new Set(Object.values(API_SERVICES).map(s => s.category))]
  
  const filteredKeys = filterCategory === 'all' 
    ? apiKeys 
    : apiKeys.filter(key => API_SERVICES[key.service_name as keyof typeof API_SERVICES]?.category === filterCategory)

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Key className="w-6 h-6 text-samurai-red" />
            API Keys
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Securely store and manage API keys for use across RMG applications
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Key
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition-all ${
              filterCategory === category
                ? 'bg-samurai-red text-white'
                : 'bg-samurai-grey-dark text-white/70 hover:bg-samurai-grey'
            }`}
          >
            {category === 'all' ? 'All' : category}
          </button>
        ))}
      </div>

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
                          <KeyDisplay keyData={key} userEmail={user?.email || ''} />
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
function KeyDisplay({ keyData, userEmail }: { keyData: ApiKey; userEmail: string }) {
  const [decrypted, setDecrypted] = useState<string>('Loading...')
  
  useEffect(() => {
    decryptApiKey(keyData.encrypted_key, userEmail)
      .then(setDecrypted)
      .catch(() => setDecrypted('Error decrypting'))
  }, [keyData.encrypted_key, userEmail])
  
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-black text-white mb-6">
          {existingKey ? 'Edit API Key' : 'Add API Key'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">Service</label>
            <select
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white focus:border-samurai-red focus:outline-none"
              required
              disabled={!!existingKey}
            >
              <option value="">Select a service...</option>
              {Object.entries(API_SERVICES).map(([key, service]) => (
                <option key={key} value={key}>
                  {service.icon} {service.name} ({service.category})
                </option>
              ))}
            </select>
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
