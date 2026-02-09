import { useState, useEffect } from 'react'
import { Lock, Plus, Edit2, Trash2, Eye, EyeOff, Copy, Check, Globe, Mail, CreditCard, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface Password {
  id: string
  user_id: string
  title: string
  username: string
  encrypted_password: string
  url?: string
  category: string
  notes?: string
  created_at: string
  updated_at: string
}

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
    // TODO: Implement actual API call
    setLoading(false)
    // Placeholder data
    setPasswords([])
  }

  const categories = ['all', ...Object.keys(PASSWORD_CATEGORIES)]
  
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
          <p className="text-white/70 text-sm mt-1">
            Securely store and manage your passwords with military-grade encryption
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all w-full sm:w-auto"
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
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {categories.map(category => {
          const catInfo = category === 'all' ? null : PASSWORD_CATEGORIES[category as keyof typeof PASSWORD_CATEGORIES]
          return (
            <button
              key={category}
              onClick={() => setFilterCategory(category)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all flex-shrink-0 ${
                filterCategory === category
                  ? 'bg-samurai-red text-white'
                  : 'bg-samurai-grey-dark text-white/70 hover:bg-samurai-grey'
              }`}
            >
              {catInfo ? `${catInfo.icon} ${catInfo.name}` : 'All'}
            </button>
          )
        })}
      </div>

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
                        {isRevealed ? '••••••••••••' : '••••••••••••••••'}
                      </code>
                    </div>
                    
                    {password.notes && (
                      <p className="text-white/50 text-xs mt-2">{password.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <button
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
                      className="p-2 rounded hover:bg-samurai-grey transition-colors"
                      title="Edit password"
                    >
                      <Edit2 className="w-4 h-4 text-white/70" />
                    </button>
                    
                    <button
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
    </div>
  )
}
