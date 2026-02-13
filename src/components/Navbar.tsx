import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Flame, Key, User, LogOut, Shield } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import DiscordIcon from './DiscordIcon'
import AuthPopup from './AuthPopup'
import ProfileDropdown from './ProfileDropdown'
import ProfilePopup from './ProfilePopup'
import AdminModal from './AdminModal'
import ContactsModal from './ContactsModal'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [showContactsModal, setShowContactsModal] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { isAdmin } = useAdmin()
  const profileRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const isOutsideButton = profileRef.current && !profileRef.current.contains(target)
      const isOutsideDropdown = profileDropdownRef.current && !profileDropdownRef.current.contains(target)
      
      if (isOutsideButton && isOutsideDropdown) {
        setShowProfileDropdown(false)
      }
    }

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfileDropdown])

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-samurai-black border-b-2 border-samurai-red sticky top-0 z-[150] shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <Flame className="text-white group-hover:text-samurai-red transition-colors animate-flame-flicker" size={38} />
              <span className="text-lg sm:text-xl md:text-2xl font-black text-white group-hover:text-samurai-red transition-colors">RONIN MEDIA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="/#forge" 
              onClick={(e) => {
                e.preventDefault()
                if (location.pathname !== '/') {
                  navigate('/')
                  setTimeout(() => {
                    const forgeSection = document.getElementById('forge')
                    if (forgeSection) {
                      forgeSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }, 100)
                } else {
                  const forgeSection = document.getElementById('forge')
                  if (forgeSection) {
                    forgeSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }
              }}
              className="font-bold transition-all relative group text-samurai-steel-light hover:text-samurai-red cursor-pointer"
            >
              FORGE
              <span className="absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all w-0 group-hover:w-full"></span>
            </a>
            
            {/* Project Links - Only show when logged in */}
            {user && (
              <>
                {/* Separator */}
                <span className="text-samurai-steel-dark text-2xl font-thin">|</span>
                
                <Link to="/omni" className={`font-bold transition-all relative group ${
                  isActive('/omni') 
                    ? 'text-samurai-red neon-text' 
                    : 'text-samurai-steel-light hover:text-samurai-red'
                }`}>
                  OMNI
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all ${
                    isActive('/omni') ? 'w-full shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
                <Link to="/scrp" className={`font-bold transition-all relative group ${
                  isActive('/scrp') 
                    ? 'text-samurai-red neon-text' 
                    : 'text-samurai-steel-light hover:text-samurai-red'
                }`}>
                  SCRP
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all ${
                    isActive('/scrp') ? 'w-full shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
                <Link to="/ldgr" className={`font-bold transition-all relative group ${
                  isActive('/ldgr') 
                    ? 'text-samurai-red neon-text' 
                    : 'text-samurai-steel-light hover:text-samurai-red'
                }`}>
                  LDGR
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all ${
                    isActive('/ldgr') ? 'w-full shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
                <Link to="/wspr" className={`font-bold transition-all relative group ${
                  isActive('/wspr') 
                    ? 'text-samurai-red neon-text' 
                    : 'text-samurai-steel-light hover:text-samurai-red'
                }`}>
                  WSPR
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all ${
                    isActive('/wspr') ? 'w-full shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
                <Link to="/nsit" className={`font-bold transition-all relative group ${
                  isActive('/nsit') 
                    ? 'text-samurai-red neon-text' 
                    : 'text-samurai-steel-light hover:text-samurai-red'
                }`}>
                  NSIT
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all ${
                    isActive('/nsit') ? 'w-full shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'w-0 group-hover:w-full'
                  }`}></span>
                </Link>
              </>
            )}
            
            {/* Separator */}
            <span className="text-samurai-steel-dark text-2xl font-thin">|</span>
            
            {/* Discord Link */}
            <Link
              to="/discord"
              className="group transition-all hover:scale-110"
              aria-label="Join our Discord"
            >
              <DiscordIcon size={28} className="text-samurai-steel-light group-hover:text-samurai-red transition-colors" />
            </Link>
            
            {/* Auth Icon */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  ref={profileButtonRef}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold cursor-pointer transition-all hover:scale-110 overflow-hidden"
                  style={!user.user_metadata?.avatar_url ? { backgroundColor: user.user_metadata?.avatar_color || '#E63946' } : {}}
                >
                  {user.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user.user_metadata?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'
                  )}
                </button>
                {showProfileDropdown && (
                  <ProfileDropdown
                    onViewProfile={() => setShowProfilePopup(true)}
                    onViewAdmin={() => setShowAdminModal(true)}
                    onViewContacts={() => setShowContactsModal(true)}
                    onClose={() => setShowProfileDropdown(false)}
                    buttonRef={profileButtonRef}
                    dropdownRef={profileDropdownRef}
                  />
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthPopup(true)}
                className="group transition-all hover:scale-110"
                aria-label="Sign in"
              >
                <Key size={28} className="text-samurai-steel-light group-hover:text-samurai-red transition-colors" />
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-samurai-steel-light hover:text-samurai-red transition-colors p-2 touch-manipulation"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-samurai-grey-darker border-t-2 border-samurai-red max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="/#forge"
              onClick={(e) => {
                e.preventDefault()
                setIsOpen(false)
                if (location.pathname !== '/') {
                  navigate('/')
                  setTimeout(() => {
                    const forgeSection = document.getElementById('forge')
                    if (forgeSection) {
                      forgeSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }, 100)
                } else {
                  const forgeSection = document.getElementById('forge')
                  if (forgeSection) {
                    forgeSection.scrollIntoView({ behavior: 'smooth' })
                  }
                }
              }}
              className="block px-4 py-3 rounded-lg font-bold transition-all touch-manipulation text-samurai-steel-light hover:bg-samurai-red hover:text-white cursor-pointer"
            >
              FORGE
            </a>
            
            {/* Only show project links when logged in */}
            {user && (
              <>
                <Link
                  to="/omni"
                  className={`block px-4 py-3 rounded-lg font-bold transition-all touch-manipulation ${
                    isActive('/omni') 
                      ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                      : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  OMNI
                </Link>
                <Link
                  to="/scraper"
                  className={`block px-4 py-3 rounded-lg font-bold transition-all touch-manipulation ${
                    isActive('/scraper') 
                      ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                      : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  SCRP
                </Link>
                <Link
                  to="/ldgr"
                  className={`block px-4 py-3 rounded-lg font-bold transition-all touch-manipulation ${
                    isActive('/ldgr') 
                      ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                      : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  LDGR
                </Link>
                <Link
                  to="/wspr"
                  className={`block px-4 py-3 rounded-lg font-bold transition-all touch-manipulation ${
                    isActive('/wspr') 
                      ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                      : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  WSPR
                </Link>
                <Link
                  to="/nsit"
                  className={`block px-4 py-3 rounded-lg font-bold transition-all touch-manipulation ${
                    isActive('/nsit') 
                      ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                      : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  NSIT
                </Link>
              </>
            )}
            
            {/* Discord Link */}
            <Link
              to="/discord"
              className="flex items-center px-4 py-3 rounded-lg transition-all touch-manipulation text-samurai-steel-light hover:bg-samurai-red hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <DiscordIcon size={24} className="mr-3" />
              <span className="font-bold">DISCORD</span>
            </Link>

            {/* Auth Section */}
            <div className="border-t-2 border-samurai-steel-dark mt-2 pt-2">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      setShowProfilePopup(true)
                    }}
                    className="w-full flex items-center px-4 py-3 rounded-lg font-bold transition-all touch-manipulation text-samurai-steel-light hover:bg-samurai-red hover:text-white"
                  >
                    <User size={24} className="mr-3" />
                    <span>VIEW PROFILE</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setIsOpen(false)
                        setShowAdminModal(true)
                      }}
                      className="w-full flex items-center px-4 py-3 rounded-lg font-bold transition-all touch-manipulation text-samurai-red hover:bg-samurai-red hover:text-white"
                    >
                      <Shield size={24} className="mr-3" />
                      <span>ADMIN PANEL</span>
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      setIsOpen(false)
                      await signOut()
                    }}
                    className="w-full flex items-center px-4 py-3 rounded-lg font-bold transition-all touch-manipulation text-samurai-steel-light hover:bg-samurai-red hover:text-white"
                  >
                    <LogOut size={24} className="mr-3" />
                    <span>LOG OUT</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsOpen(false)
                    setShowAuthPopup(true)
                  }}
                  className="w-full flex items-center justify-center px-4 py-3 rounded-lg font-bold transition-all touch-manipulation bg-samurai-red text-white hover:bg-samurai-red-dark"
                >
                  <Key size={24} className="mr-3" />
                  <span>SIGN IN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Auth Popup */}
      {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}
      
      {/* Profile Popup */}
      {showProfilePopup && <ProfilePopup onClose={() => setShowProfilePopup(false)} />}
      
      {/* Admin Modal */}
      {showAdminModal && <AdminModal onClose={() => setShowAdminModal(false)} />}
      
      {/* Contacts Modal */}
      {showContactsModal && <ContactsModal isOpen={showContactsModal} onClose={() => setShowContactsModal(false)} />}
    </nav>
  )
}
