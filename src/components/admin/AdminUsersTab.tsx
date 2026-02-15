import { useState, useEffect } from 'react'
import { Shield, Eye, Trash2, Clock, Search, Ban, ArrowUpDown } from 'lucide-react'
import { getAllUsers, updateUserRole, type UserRole } from '../../lib/admin'
import { supabase } from '../../lib/supabase'

interface DisplayNameHistory {
  display_name: string
  changed_at: string
}

interface UserWithDisplayName extends UserRole {
  display_name?: string
  display_name_history?: DisplayNameHistory[]
  is_banned?: boolean
  last_sign_in?: string | null
}

type SortKey = 'name' | 'joined' | 'role' | 'last_login'

export default function AdminUsersTab() {
  const [users, setUsers] = useState<UserWithDisplayName[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredUser, setHoveredUser] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('joined')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const allUsers = await getAllUsers()
    
    // Fetch all display names + last sign-in via RPC function
    const { data: displayNames } = await supabase.rpc('get_user_display_names')
    const displayNameMap = new Map(displayNames?.map((d: any) => [d.user_id, d.display_name]) || [])
    const signInMap = new Map(displayNames?.map((d: any) => [d.user_id, d.last_sign_in_at]) || [])
    
    // Fetch display name history for each user
    const usersWithDisplayNames = await Promise.all(allUsers.map(async (user) => {
      const displayName = displayNameMap.get(user.user_id) as string | undefined
      
      // Get display name history
      const { data: history } = await supabase
        .from('display_name_history')
        .select('display_name, changed_at')
        .eq('user_id', user.user_id)
        .order('changed_at', { ascending: false })

      // Check ban status
      const { data: banData } = await supabase
        .from('user_bans')
        .select('id')
        .eq('user_id', user.user_id)
        .maybeSingle()
      
      return {
        ...user,
        display_name: displayName,
        display_name_history: history || [],
        is_banned: !!banData,
        last_sign_in: (signInMap.get(user.user_id) as string | undefined) || null,
      }
    }))
    
    setUsers(usersWithDisplayNames)
    setLoading(false)
  }

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Remove' : 'Grant'} admin privileges?`)) return
    await updateUserRole(userId, { is_admin: !currentStatus })
    await loadUsers()
  }

  const handleToggleModerator = async (userId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Remove' : 'Grant'} moderator privileges?`)) return
    await updateUserRole(userId, { is_moderator: !currentStatus })
    await loadUsers()
  }

  const handleToggleBan = async (userId: string, email: string, isBanned: boolean) => {
    if (!confirm(`${isBanned ? 'Unban' : 'Ban'} user ${email}?`)) return
    if (isBanned) {
      await supabase.from('user_bans').delete().eq('user_id', userId)
    } else {
      await supabase.from('user_bans').upsert({ user_id: userId, banned_at: new Date().toISOString() })
    }
    await loadUsers()
  }

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This removes ALL data across every app.`)) return
    if (!confirm(`Are you absolutely sure? This cannot be undone.`)) return
    
    await Promise.allSettled([
      supabase.from('files').delete().eq('user_id', userId),
      supabase.from('folders').delete().eq('user_id', userId),
      supabase.from('folder_access').delete().eq('user_id', userId),
      supabase.from('wspr_messages').delete().eq('user_id', userId),
      supabase.from('wspr_channels').delete().eq('created_by', userId),
      supabase.from('wspr_channel_members').delete().eq('user_id', userId),
      supabase.from('wspr_dm_messages').delete().eq('sender_id', userId),
      supabase.from('wspr_profiles').delete().eq('user_id', userId),
      supabase.from('forum_posts').delete().eq('user_id', userId),
      supabase.from('forum_threads').delete().eq('user_id', userId),
      supabase.from('display_name_history').delete().eq('user_id', userId),
      supabase.from('user_bans').delete().eq('user_id', userId),
      supabase.from('api_keys').delete().eq('user_id', userId),
      supabase.from('passwords').delete().eq('user_id', userId),
      supabase.from('crypto_wallets').delete().eq('user_id', userId),
      supabase.from('user_roles').delete().eq('user_id', userId),
    ])
    alert('All user data deleted')
    await loadUsers()
  }

  const getName = (u: UserWithDisplayName) => u.display_name || u.email || ''

  const filtered = users
    .filter(u => {
      if (!search) return true
      const q = search.toLowerCase()
      return getName(u).toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.user_id.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name': cmp = getName(a).localeCompare(getName(b)); break
        case 'joined': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break
        case 'role': cmp = (a.is_admin ? 2 : a.is_moderator ? 1 : 0) - (b.is_admin ? 2 : b.is_moderator ? 1 : 0); break
        case 'last_login': cmp = new Date(a.last_sign_in || 0).getTime() - new Date(b.last_sign_in || 0).getTime(); break
      }
      return sortAsc ? cmp : -cmp
    })

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc); else { setSortBy(key); setSortAsc(false) }
  }

  const timeAgo = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Never'
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    if (days < 30) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-samurai-red border-t-transparent"></div></div>
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <h3 className="text-lg sm:text-2xl font-bold text-white">User Management</h3>
        <div className="text-xs sm:text-base text-samurai-steel">Total: <span className="text-white font-bold">{users.length}</span>{search && <span className="ml-2">Showing: <span className="text-white font-bold">{filtered.length}</span></span>}</div>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-samurai-steel" />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-samurai-black border border-samurai-steel-dark rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-samurai-red placeholder:text-samurai-steel/50"
          />
        </div>
        <div className="flex gap-1">
          {(['name', 'joined', 'role', 'last_login'] as SortKey[]).map(key => (
            <button
              key={key}
              onClick={() => handleSort(key)}
              className={`px-2 py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase flex items-center gap-1 ${
                sortBy === key ? 'bg-samurai-red/20 text-samurai-red' : 'bg-samurai-steel-dark/50 text-samurai-steel hover:text-white'
              }`}
            >
              {key === 'last_login' ? 'Login' : key}
              {sortBy === key && <ArrowUpDown size={10} />}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-samurai-steel py-8 text-sm">No users match "{search}"</p>
      )}

      {filtered.map((user) => (
        <div key={user.id} className={`bg-samurai-black border rounded-lg p-3 sm:p-4 hover:border-samurai-red transition-colors ${
          user.is_banned ? 'border-red-800/50 opacity-60' : 'border-samurai-steel-dark'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm sm:text-base text-white font-bold break-all">{user.display_name || user.email}</h4>
                  {user.display_name_history && user.display_name_history.length > 0 && (
                    <div 
                      className="relative"
                      onMouseEnter={() => setHoveredUser(user.user_id)}
                      onMouseLeave={() => setHoveredUser(null)}
                    >
                      <Clock size={14} className="text-samurai-steel cursor-help" />
                      {hoveredUser === user.user_id && (
                        <div className="absolute left-0 top-6 z-50 bg-samurai-black border border-samurai-red rounded-lg p-3 shadow-xl min-w-[250px]">
                          <p className="text-xs text-samurai-steel mb-2 font-bold">Display Name History:</p>
                          <div className="space-y-1.5">
                            {user.display_name_history.map((hist, idx) => (
                              <div key={idx} className="text-xs">
                                <span className="text-white font-medium">{hist.display_name}</span>
                                <span className="text-samurai-steel ml-2">
                                  {new Date(hist.changed_at).toLocaleDateString()} {new Date(hist.changed_at).toLocaleTimeString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {user.is_admin && <span className="px-2 py-1 bg-samurai-red text-white text-xs font-bold rounded">ADMIN</span>}
                {user.is_moderator && !user.is_admin && <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">MOD</span>}
                {user.is_banned && <span className="px-2 py-1 bg-red-900 text-red-300 text-xs font-bold rounded">BANNED</span>}
              </div>
              {user.display_name && user.email !== user.display_name && (
                <p className="text-xs text-samurai-steel mb-1">{user.email}</p>
              )}
              <div className="text-xs sm:text-sm text-samurai-steel space-y-1">
                <p className="break-all">ID: {user.user_id.slice(0, 8)}...</p>
                <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
                <p>Last login: {timeAgo(user.last_sign_in)}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleToggleAdmin(user.user_id, user.is_admin)} title={user.is_admin ? 'Remove Admin' : 'Grant Admin'} className={`px-2 sm:px-3 py-2 rounded ${user.is_admin ? 'bg-samurai-red/20 text-samurai-red' : 'bg-samurai-steel-dark text-white'}`}>
                <Shield size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button onClick={() => handleToggleModerator(user.user_id, user.is_moderator)} title={user.is_moderator ? 'Remove Mod' : 'Grant Mod'} className={`px-2 sm:px-3 py-2 rounded ${user.is_moderator ? 'bg-blue-600/20 text-blue-400' : 'bg-samurai-steel-dark text-white'}`}>
                <Eye size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button onClick={() => handleToggleBan(user.user_id, user.email, !!user.is_banned)} title={user.is_banned ? 'Unban' : 'Ban'} className={`px-2 sm:px-3 py-2 rounded ${user.is_banned ? 'bg-red-900/30 text-red-400' : 'bg-samurai-steel-dark text-white'}`}>
                <Ban size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button onClick={() => handleDeleteUser(user.user_id, user.email)} title="Delete User" className="px-2 sm:px-3 py-2 bg-red-900/20 text-red-400 rounded">
                <Trash2 size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
