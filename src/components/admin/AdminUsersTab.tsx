import { useState, useEffect } from 'react'
import { Shield, Eye, Trash2 } from 'lucide-react'
import { getAllUsers, updateUserRole, type UserRole } from '../../lib/admin'
import { supabase } from '../../lib/supabase'

export default function AdminUsersTab() {
  const [users, setUsers] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setLoading(true)
    const allUsers = await getAllUsers()
    setUsers(allUsers)
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-white">User Management</h3>
        <div className="text-samurai-steel">Total: <span className="text-white font-bold">{users.length}</span></div>
      </div>

      {users.map((user) => (
        <div key={user.id} className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-4 hover:border-samurai-red transition-colors">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="text-white font-bold">{user.email}</h4>
                {user.is_admin && <span className="px-2 py-1 bg-samurai-red text-white text-xs font-bold rounded">ADMIN</span>}
                {user.is_moderator && !user.is_admin && <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">MOD</span>}
              </div>
              <div className="text-sm text-samurai-steel">
                <p>ID: {user.user_id.slice(0, 8)}...</p>
                <p>Joined: {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => handleToggleAdmin(user.user_id, user.is_admin)} className={`px-3 py-2 rounded ${user.is_admin ? 'bg-samurai-red/20 text-samurai-red' : 'bg-samurai-steel-dark text-white'}`}>
                <Shield size={16} />
              </button>
              <button onClick={() => handleToggleModerator(user.user_id, user.is_moderator)} className={`px-3 py-2 rounded ${user.is_moderator ? 'bg-blue-600/20 text-blue-400' : 'bg-samurai-steel-dark text-white'}`}>
                <Eye size={16} />
              </button>
              <button onClick={() => handleDeleteUser(user.user_id, user.email)} className="px-3 py-2 bg-red-900/20 text-red-400 rounded">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
