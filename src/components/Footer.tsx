import { Link } from 'react-router-dom'
import { Github } from 'lucide-react'
import DiscordIcon from './DiscordIcon'

export default function Footer() {
  return (
    <footer className="bg-samurai-black border-t-2 border-samurai-red text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Copyright */}
          <div className="text-xs text-samurai-steel-light">
            &copy; {new Date().getFullYear()} <span className="font-bold text-white">RONIN MEDIA</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/54MUR-AI" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-7 h-7 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all"
              aria-label="GitHub"
            >
              <Github size={14} />
            </a>
            <Link 
              to="/discord" 
              className="w-7 h-7 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all"
              aria-label="Discord"
            >
              <DiscordIcon size={14} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
