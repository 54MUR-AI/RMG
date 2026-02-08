import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserRole, UserRole } from '../lib/admin'

interface AdminContextType {
  isAdmin: boolean
  isModerator: boolean
  userRole: UserRole | null
  loading: boolean
  refreshRole: () => Promise<void>
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  isModerator: false,
  userRole: null,
  loading: true,
  refreshRole: async () => {},
})

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [userRole, setUserRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const loadRole = async () => {
    if (!user) {
      setUserRole(null)
      setLoading(false)
      return
    }

    try {
      const role = await getUserRole()
      setUserRole(role)
    } catch (error) {
      console.error('Failed to load user role:', error)
      setUserRole(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRole()
  }, [user])

  const refreshRole = async () => {
    setLoading(true)
    await loadRole()
  }

  const value = {
    isAdmin: userRole?.is_admin || false,
    isModerator: userRole?.is_moderator || userRole?.is_admin || false,
    userRole,
    loading,
    refreshRole,
  }

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

export function useAdmin() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider')
  }
  return context
}
