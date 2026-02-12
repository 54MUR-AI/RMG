import { useState, useEffect } from 'react'
import { Lock, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Check, Globe } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import FilterDropdown from './FilterDropdown'
import {
  getUserPasswords,
  addPassword,
  updatePassword,
  deletePassword,
  decryptPassword,
  type Password,
  type PasswordInput
} from '../../lib/ldgr/passwords'

const PASSWORD_CATEGORIES = {
  social: { name: 'Social', icon: '👥', color: 'blue' },
  email: { name: 'Email', icon: '📧', color: 'green' },
  banking: { name: 'Banking', icon: '🏦', color: 'yellow' },
  shopping: { name: 'Shopping', icon: '🛒', color: 'purple' },
  work: { name: 'Work', icon: '💼', color: 'cyan' },
  entertainment: { name: 'Entertainment', icon: '🎮', color: 'pink' },
  other: { name: 'Other', icon: '🔧', color: 'gray' }
}

export default function PasswordManager() {
  const { user } = useAuth()
  const [passwords, setPasswords] = useState<Password[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPassword, setEditingPassword] = useState<Password | null>(null)
  const [revealedPasswords, setRevealedPasswords] = useState<Set<string>>(new Set())
  const [copiedPassword, setCopiedPassword] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (user) {
      loadPasswords()
    }
  }, [user])

  const loadPasswords = async () => {
    if (!user) return
    try {
      setLoading(true)
      const data = await getUserPasswords(user.id)
      setPasswords(data)
    } catch (error) {
      console.error('Error loading passwords:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPassword = async (input: PasswordInput) => {
    if (!user) return
    try {
      await addPassword(user.id, user.id, input)
      await loadPasswords()
      setShowAddModal(false)
    } catch (error) {
      console.error('Error adding password:', error)
      alert('Failed to add password. Please try again.')
    }
  }

  const handleUpdatePassword = async (passwordId: string, updates: Partial<PasswordInput>) => {
    if (!user) return
    try {
      await updatePassword(passwordId, user.id, updates)
      await loadPasswords()
      setEditingPassword(null)
    } catch (error) {
      console.error('Error updating password:', error)
      alert('Failed to update password. Please try again.')
    }
  }

  const handleDeletePassword = async (passwordId: string, title: string) => {
    if (!confirm(`Delete password "${title}"?`)) return
    try {
      await deletePassword(passwordId)
      await loadPasswords()
    } catch (error) {
      console.error('Error deleting password:', error)
      alert('Failed to delete password. Please try again.')
    }
  }

  const handleRevealPassword = (passwordId: string) => {
    if (revealedPasswords.has(passwordId)) {
      setRevealedPasswords(prev => {
        const next = new Set(prev)
        next.delete(passwordId)
        return next
      })
    } else {
      setRevealedPasswords(prev => new Set(prev).add(passwordId))
    }
  }

  const handleCopyPassword = async (password: Password) => {
    if (!user) return
    try {
      const decrypted = await decryptPassword(password.encrypted_password, user.email || '', user.id)
      await navigator.clipboard.writeText(decrypted)
      setCopiedPassword(password.id)
      setTimeout(() => setCopiedPassword(null), 2000)
    } catch (error) {
      console.error('Error copying password:', error)
      alert('Failed to copy password. Please try again.')
    }
  }
  
  const filteredPasswords = passwords.filter(pwd => {
    const matchesCategory = filterCategory === 'all' || pwd.category === filterCategory
    const matchesSearch = !searchQuery || 
      pwd.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pwd.username.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
        <p className="mt-4 text-white/70">Loading passwords...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-samurai-red" />
            Password Manager
          </h2>
          <p className="text-white/70 text-sm mt-1 hidden sm:block">
            Securely store and manage your passwords with military-grade encryption
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flex-1 sm:flex-none"
        >
          <Plus className="w-4 h-4" />
          Add Password
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search passwords..."
          className="w-full px-4 py-3 pl-10 bg-samurai-grey-darker border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
        />
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
      </div>

      {/* Category Filter */}
      <FilterDropdown
        label="Filter by Category"
        value={filterCategory}
        onChange={setFilterCategory}
        options={[
          { value: 'all', label: 'All Categories' },
          ...Object.entries(PASSWORD_CATEGORIES).map(([key, cat]) => ({
            value: key,
            label: cat.name,
            icon: cat.icon
          }))
        ]}
      />

      {/* Passwords List */}
      {filteredPasswords.length === 0 ? (
        <div className="text-center py-12 bg-samurai-grey-darker rounded-lg border-2 border-samurai-grey">
          <Lock className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No passwords yet</p>
          <p className="text-white/50 text-sm mt-2">Add your first password to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPasswords.map(password => {
            const category = PASSWORD_CATEGORIES[password.category as keyof typeof PASSWORD_CATEGORIES]
            const isRevealed = revealedPasswords.has(password.id)
            
            return (
              <div
                key={password.id}
                className="bg-samurai-grey-darker border-2 border-samurai-steel-dark rounded-lg p-4 hover:border-samurai-red/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white truncate">{password.title}</h3>
                        <p className="text-sm text-white/60 truncate">{password.username}</p>
                      </div>
                    </div>
                    
                    {password.url && (
                      <a
                        href={password.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-samurai-red text-sm hover:underline flex items-center gap-1 mb-2"
                      >
                        <Globe className="w-3 h-3" />
                        {password.url}
                      </a>
                    )}
                    
                    <div className="flex items-center gap-2 mb-2">
                      <code className="flex-1 px-3 py-2 bg-samurai-black rounded text-white/90 text-sm font-mono break-all">
                        {isRevealed ? (
                          <PasswordDisplay password={password} userEmail={user?.email || ''} userId={user?.id || ''} />
                        ) : (
                          '••••••••••••••••'
                        )}
                      </code>
                    </div>
                    
                    {password.notes && (
                      <p className="text-white/50 text-xs mt-2">{password.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
                      onClick={() => handleRevealPassword(password.id)}
                      className="p-2 rounded hover:bg-samurai-grey transition-colors"
                      title="Reveal password"
                    >
                      {isRevealed ? (
                        <EyeOff className="w-4 h-4 text-white/70" />
                      ) : (
                        <Eye className="w-4 h-4 text-white/70" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleCopyPassword(password)}
                      className="p-2 rounded hover:bg-samurai-grey transition-colors"
                      title="Copy password"
                    >
                      {copiedPassword === password.id ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-white/70" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => setEditingPassword(password)}
                      className="p-2 rounded hover:bg-samurai-grey transition-colors"
                      title="Edit password"
                    >
                      <Edit2 className="w-4 h-4 text-white/70" />
                    </button>
                    
                    <button
                      onClick={() => handleDeletePassword(password.id, password.title)}
                      className="p-2 rounded hover:bg-red-600 transition-colors"
                      title="Delete password"
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
      {(showAddModal || editingPassword) && (
        <PasswordModal
          existingPassword={editingPassword}
          onSave={editingPassword ? 
            (input) => handleUpdatePassword(editingPassword.id, input) : 
            handleAddPassword
          }
          onClose={() => {
            setShowAddModal(false)
            setEditingPassword(null)
          }}
        />
      )}
    </div>
  )
}

// Component to display decrypted password
function PasswordDisplay({ password, userEmail, userId }: { password: Password; userEmail: string; userId: string }) {
  const [decrypted, setDecrypted] = useState<string>('Loading...')
  
  useEffect(() => {
    decryptPassword(password.encrypted_password, userEmail, userId)
      .then(setDecrypted)
      .catch(() => setDecrypted('Error decrypting'))
  }, [password.encrypted_password, userEmail, userId])
  
  return <>{decrypted}</>
}

// Modal for adding/editing passwords
function PasswordModal({
  existingPassword,
  onSave,
  onClose
}: {
  existingPassword: Password | null
  onSave: (input: PasswordInput) => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState(existingPassword?.title || '')
  const [username, setUsername] = useState(existingPassword?.username || '')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState(existingPassword?.url || '')
  const [category, setCategory] = useState(existingPassword?.category || 'other')
  const [notes, setNotes] = useState(existingPassword?.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !username || (!password && !existingPassword)) return
    
    try {
      setSaving(true)
      await onSave({
        title,
        username,
        password,
        url,
        category,
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
          {existingPassword ? 'Edit Password' : 'Add Password'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Gmail, Facebook, Bank Account"
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">Username/Email</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username or email@example.com"
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">
              Password {existingPassword && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none font-mono"
              required={!existingPassword}
            />
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">URL (optional)</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-grey rounded-lg text-white focus:border-samurai-red focus:outline-none"
              required
            >
              <option value="social">👥 Social</option>
              <option value="email">📧 Email</option>
              <option value="banking">🏦 Banking</option>
              <option value="shopping">🛒 Shopping</option>
              <option value="work">💼 Work</option>
              <option value="entertainment">🎮 Entertainment</option>
              <option value="other">🔧 Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-white font-semibold mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
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
              {saving ? 'Saving...' : existingPassword ? 'Update Password' : 'Add Password'}
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
