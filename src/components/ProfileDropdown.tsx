import { LogOut, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ModalPortal from './ModalPortal'

interface ProfileDropdownProps {
  onViewProfile: () => void
  onClose: () => void
}

export default function ProfileDropdown({ onViewProfile, onClose }: ProfileDropdownProps) {
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    onClose()
  }

  const handleViewProfile = () => {
    onViewProfile()
    onClose()
  }

  return (
    <ModalPortal>
      <div className="absolute right-0 top-12 w-64 bg-samurai-grey-darker border-2 border-samurai-red rounded-lg shadow-2xl shadow-samurai-red/20 overflow-hidden z-50">
      {/* User Info */}
      <div className="p-4 border-b border-samurai-steel-dark">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-samurai-red flex items-center justify-center text-white font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold truncate">
              {user?.user_metadata?.preferred_username || user?.user_metadata?.name || 'User'}
            </p>
            <p className="text-white/60 text-sm truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={handleViewProfile}
          className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-samurai-red/20 transition-colors"
        >
          <User size={18} />
          <span>View Profile</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-samurai-red/20 transition-colors"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
    </ModalPortal>
  )
}
