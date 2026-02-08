import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import DiscordIcon from './DiscordIcon'

export default function Footer() {
  return (
    <footer className="bg-samurai-black border-t-2 border-samurai-red text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Copyright */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-samurai-steel-light">
              &copy; {new Date().getFullYear()} <span className="font-bold text-white">RONIN MEDIA</span>
            </p>
            <p className="text-xs text-samurai-steel">Digital Damascus for the Cyber Samurai</p>
          </div>

          {/* Center: Quick Links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Link to="/omni" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">OMNI</Link>
            <span className="text-samurai-steel-dark">•</span>
            <Link to="/scraper" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">SCRP</Link>
            <span className="text-samurai-steel-dark">•</span>
            <Link to="/ldgr" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">LDGR</Link>
            <span className="text-samurai-steel-dark">•</span>
            <Link to="/wspr" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">WSPR</Link>
            <span className="text-samurai-steel-dark">•</span>
            <Link to="/stonks" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">STONKS</Link>
          </div>

          {/* Right: Social Links */}
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/54MUR-AI" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-8 h-8 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <Link 
              to="/discord" 
              className="w-8 h-8 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all"
              aria-label="Discord"
            >
              <DiscordIcon size={16} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
