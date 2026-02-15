import { LogOut, User, Shield, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'
import { getPendingRequests } from '../lib/contacts'
import { useState, useEffect } from 'react'
import ModalPortal from './ModalPortal'

interface ProfileDropdownProps {
  onViewProfile: () => void
  onViewAdmin: () => void
  onViewContacts: () => void
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement>
  dropdownRef: React.RefObject<HTMLDivElement>
}

export default function ProfileDropdown({ onViewProfile, onViewAdmin, onViewContacts, onClose, buttonRef, dropdownRef }: ProfileDropdownProps) {
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdmin()
  const [pendingCount, setPendingCount] = useState(0)

  const handleLogout = async () => {
    await signOut()
    onClose()
  }

  const handleViewProfile = () => {
    onViewProfile()
    onClose()
  }

  const handleViewContacts = () => {
    onViewContacts()
    onClose()
  }

  useEffect(() => {
    const loadPendingCount = async () => {
      if (user) {
        const requests = await getPendingRequests(user.id)
        setPendingCount(requests.length)
      }
    }
    loadPendingCount()
  }, [user])

  // Calculate position based on button
  const buttonRect = buttonRef.current?.getBoundingClientRect()
  const top = buttonRect ? buttonRect.bottom + 8 : 64
  const right = buttonRect ? window.innerWidth - buttonRect.right : 16

  return (
    <ModalPortal>
      <div 
        ref={dropdownRef}
        className="fixed w-64 bg-samurai-grey-darker border-2 border-samurai-red rounded-lg shadow-2xl shadow-samurai-red/20 overflow-hidden z-[9999]"
        style={{ top: `${top}px`, right: `${right}px` }}
      >
      {/* User Info */}
      <div className="p-4 border-b border-samurai-steel-dark">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden"
            style={!user?.user_metadata?.avatar_url ? { backgroundColor: user?.user_metadata?.avatar_color || '#E63946' } : {}}
          >
            {user?.user_metadata?.avatar_url ? (
              <img
                src={user.user_metadata.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              (user?.user_metadata?.display_name?.charAt(0) || user?.email?.charAt(0) || 'U').toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold truncate">
              {user?.user_metadata?.display_name || user?.user_metadata?.preferred_username || user?.user_metadata?.name || 'User'}
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
          onClick={handleViewContacts}
          className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-samurai-red/20 transition-colors relative"
        >
          <Users size={18} />
          <span>Contacts</span>
          {pendingCount > 0 && (
            <span className="ml-auto w-5 h-5 bg-yellow-500 text-black text-xs rounded-full flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
        </button>
        
        {isAdmin && (
          <button
            onClick={() => { onViewAdmin(); onClose(); }}
            className="w-full px-4 py-3 flex items-center gap-3 text-samurai-red hover:bg-samurai-red/20 transition-colors font-bold"
          >
            <Shield size={18} />
            <span>Admin Panel</span>
          </button>
        )}

        <a
          href="https://discord.gg/roninmedia"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-samurai-red/20 transition-colors"
          onClick={onClose}
        >
          <img src="/discord-logo.svg" alt="Discord" className="w-[18px] h-[18px] brightness-0 invert" />
          <span>Enter Dojo</span>
        </a>
        
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
