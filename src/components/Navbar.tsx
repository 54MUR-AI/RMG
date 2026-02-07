import { Link } from 'react-router-dom'
import { Menu, X, Github } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Ronin Media Group</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Home
            </Link>
            <Link to="/stonks" className="text-gray-700 hover:text-purple-600 font-medium transition">
              STONKS
            </Link>
            <Link to="/scraper" className="text-gray-700 hover:text-purple-600 font-medium transition">
              Scraper
            </Link>
            <a 
              href="https://github.com/54MUR-AI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Github size={20} />
              <span>GitHub</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-purple-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/stonks"
              className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              STONKS
            </Link>
            <Link
              to="/scraper"
              className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md"
              onClick={() => setIsOpen(false)}
            >
              Scraper
            </Link>
            <a
              href="https://github.com/54MUR-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-md"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
