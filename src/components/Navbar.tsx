import { Link } from 'react-router-dom'
import { Menu, X, Github, Flame } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-samurai-black border-b-2 border-samurai-red sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                <Flame className="text-samurai-red animate-flame-flicker" size={28} />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-black text-white group-hover:text-samurai-red transition-colors">RONIN MEDIA GROUP</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-samurai-steel-light hover:text-samurai-red font-bold transition-colors relative group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-samurai-red group-hover:w-full transition-all"></span>
            </Link>
            <Link to="/stonks" className="text-samurai-steel-light hover:text-samurai-red font-bold transition-colors relative group">
              STONKS
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-samurai-red group-hover:w-full transition-all"></span>
            </Link>
            <Link to="/scraper" className="text-samurai-steel-light hover:text-samurai-red font-bold transition-colors relative group">
              SCRAPER
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-samurai-red group-hover:w-full transition-all"></span>
            </Link>
            <a 
              href="https://github.com/54MUR-AI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-samurai-red text-white px-5 py-2.5 rounded-lg hover:bg-samurai-red-dark transition-all flame-glow font-bold"
            >
              <Github size={20} />
              <span>GITHUB</span>
            </a>
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
              className="block px-4 py-4 text-samurai-steel-light hover:bg-samurai-red hover:text-white rounded-lg font-bold transition-all touch-manipulation text-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/stonks"
              className="block px-4 py-4 text-samurai-steel-light hover:bg-samurai-red hover:text-white rounded-lg font-bold transition-all touch-manipulation text-lg"
              onClick={() => setIsOpen(false)}
            >
              STONKS
            </Link>
            <Link
              to="/scraper"
              className="block px-4 py-4 text-samurai-steel-light hover:bg-samurai-red hover:text-white rounded-lg font-bold transition-all touch-manipulation text-lg"
              onClick={() => setIsOpen(false)}
            >
              SCRAPER
            </Link>
            <a
              href="https://github.com/54MUR-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-4 text-samurai-steel-light hover:bg-samurai-red hover:text-white rounded-lg font-bold transition-all touch-manipulation text-lg"
            >
              GITHUB
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
