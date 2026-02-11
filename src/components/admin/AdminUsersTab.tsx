import { useState, useEffect } from 'react'
import { Shield, Eye, Trash2, Clock } from 'lucide-react'
import { getAllUsers, updateUserRole, type UserRole } from '../../lib/admin'
import { supabase } from '../../lib/supabase'

interface DisplayNameHistory {
  display_name: string
  changed_at: string
}

interface UserWithDisplayName extends UserRole {
  display_name?: string
  display_name_history?: DisplayNameHistory[]
}

export default function AdminUsersTab() {
  const [users, setUsers] = useState<UserWithDisplayName[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredUser, setHoveredUser] = useState<string | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const allUsers = await getAllUsers()
    
    // Fetch all display names via RPC function
    const { data: displayNames } = await supabase.rpc('get_user_display_names')
    const displayNameMap = new Map(displayNames?.map(d => [d.user_id, d.display_name]) || [])
    
    // Fetch display name history for each user
    const usersWithDisplayNames = await Promise.all(allUsers.map(async (user) => {
      const displayName = displayNameMap.get(user.user_id)
      
      // Get display name history
      const { data: history } = await supabase
        .from('display_name_history')
        .select('display_name, changed_at')
        .eq('user_id', user.user_id)
        .order('changed_at', { ascending: false })
      
      return {
        ...user,
        display_name: displayName,
        display_name_history: history || []
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

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This will remove all their data.`)) return
    
    await supabase.from('files').delete().eq('user_id', userId)
    await supabase.from('folders').delete().eq('user_id', userId)
    await supabase.from('user_roles').delete().eq('user_id', userId)
    alert('User data deleted')
    await loadUsers()
  }

  if (loading) {
    return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-samurai-red border-t-transparent"></div></div>
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-lg sm:text-2xl font-bold text-white">User Management</h3>
        <div className="text-xs sm:text-base text-samurai-steel">Total: <span className="text-white font-bold">{users.length}</span></div>
      </div>

      {users.map((user) => (
        <div key={user.id} className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-4 hover:border-samurai-red transition-colors">
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
              </div>
              {user.display_name && user.email !== user.display_name && (
                <p className="text-xs text-samurai-steel mb-1">{user.email}</p>
              )}
              <div className="text-xs sm:text-sm text-samurai-steel space-y-1">
                <p className="break-all">ID: {user.user_id.slice(0, 8)}...</p>
                <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => handleToggleAdmin(user.user_id, user.is_admin)} className={`px-2 sm:px-3 py-2 rounded ${user.is_admin ? 'bg-samurai-red/20 text-samurai-red' : 'bg-samurai-steel-dark text-white'}`}>
                <Shield size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button onClick={() => handleToggleModerator(user.user_id, user.is_moderator)} className={`px-2 sm:px-3 py-2 rounded ${user.is_moderator ? 'bg-blue-600/20 text-blue-400' : 'bg-samurai-steel-dark text-white'}`}>
                <Eye size={14} className="sm:w-4 sm:h-4" />
              </button>
              <button onClick={() => handleDeleteUser(user.user_id, user.email)} className="px-2 sm:px-3 py-2 bg-red-900/20 text-red-400 rounded">
                <Trash2 size={14} className="sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
