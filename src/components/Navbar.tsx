import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Flame } from 'lucide-react'
import { useState } from 'react'
import KatanaUnderline from './KatanaUnderline'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-samurai-black border-b-2 border-samurai-red sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <Flame className="text-white group-hover:text-samurai-red transition-colors animate-flame-flicker" size={38} />
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl md:text-2xl font-black text-white group-hover:text-samurai-red transition-colors">RONIN MEDIA</span>
                <KatanaUnderline width={160} className="text-samurai-red opacity-70 group-hover:opacity-100 transition-opacity mt-1" />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className={`font-bold transition-all relative group ${
              isActive('/') 
                ? 'text-samurai-red neon-text' 
                : 'text-samurai-steel-light hover:text-samurai-red'
            }`}>
              Home
              <span className={`absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all ${
                isActive('/') ? 'w-full shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link to="/stonks" className={`font-bold transition-all relative group ${
              isActive('/stonks') 
                ? 'text-samurai-red neon-text' 
                : 'text-samurai-steel-light hover:text-samurai-red'
            }`}>
              STONKS
              <span className={`absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all ${
                isActive('/stonks') ? 'w-full shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            <Link to="/scraper" className={`font-bold transition-all relative group ${
              isActive('/scraper') 
                ? 'text-samurai-red neon-text' 
                : 'text-samurai-steel-light hover:text-samurai-red'
            }`}>
              SCRP
              <span className={`absolute bottom-0 left-0 h-0.5 bg-samurai-red transition-all ${
                isActive('/scraper') ? 'w-full shadow-[0_0_10px_rgba(230,57,70,0.8)]' : 'w-0 group-hover:w-full'
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
        <div className="md:hidden bg-samurai-grey-darker border-t-2 border-samurai-red">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-4 py-4 rounded-lg font-bold transition-all touch-manipulation text-lg ${
                isActive('/') 
                  ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                  : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/stonks"
              className={`block px-4 py-4 rounded-lg font-bold transition-all touch-manipulation text-lg ${
                isActive('/stonks') 
                  ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                  : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              STONKS
            </Link>
            <Link
              to="/scraper"
              className={`block px-4 py-4 rounded-lg font-bold transition-all touch-manipulation text-lg ${
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
              className={`block px-4 py-4 rounded-lg font-bold transition-all touch-manipulation text-lg ${
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
              className={`block px-4 py-4 rounded-lg font-bold transition-all touch-manipulation text-lg ${
                isActive('/wspr') 
                  ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                  : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              WSPR
            </Link>
            <Link
              to="/omni"
              className={`block px-4 py-4 rounded-lg font-bold transition-all touch-manipulation text-lg ${
                isActive('/omni') 
                  ? 'bg-samurai-red text-white shadow-lg shadow-samurai-red/50' 
                  : 'text-samurai-steel-light hover:bg-samurai-red hover:text-white'
              }`}
              onClick={() => setIsOpen(false)}
            >
              OMNI
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
