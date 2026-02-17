import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Github, BookOpen, Settings, Flame } from 'lucide-react'
import ReadmePopup from './ReadmePopup'

const APP_CONFIG: Record<string, { label: string; readme: string }> = {
  '/wspr': { label: 'WSPR', readme: '/appReadmes/wspr.md' },
  '/scrp': { label: 'SCRP', readme: '/appReadmes/scrp.md' },
  '/ldgr': { label: 'LDGR', readme: '/appReadmes/ldgr.md' },
  '/omni': { label: 'OMNI', readme: '/appReadmes/omni.md' },
  '/nsit': { label: 'N-SIT', readme: '/appReadmes/nsit.md' },
}

export default function Footer() {
  const location = useLocation()
  const appConfig = APP_CONFIG[location.pathname]
  const [embersOn, setEmbersOn] = useState(() => localStorage.getItem('rmg-embers') !== 'off')
  const [showReadme, setShowReadme] = useState(false)
  const [nsitTab, setNsitTab] = useState<string | null>(null)

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NSIT_TAB_CHANGE' && typeof event.data.tab === 'string') {
        setNsitTab(event.data.tab)
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const toggleEmbers = () => {
    const next = !embersOn
    setEmbersOn(next)
    localStorage.setItem('rmg-embers', next ? 'on' : 'off')
    window.dispatchEvent(new CustomEvent('rmg:embers', { detail: next }))
  }

  return (
    <footer className="bg-samurai-black border-t-2 border-samurai-red text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Copyright */}
          <div className="text-xs text-samurai-steel-light">
            &copy; {new Date().getFullYear()} <span className="font-bold text-white">RONIN MEDIA</span> <span className="font-extralight text-white">GROUP</span>
          </div>

          {/* Center: App label when on an app page */}
          {appConfig && (
            <div className="text-xs font-bold text-samurai-red tracking-wider">
              {appConfig.label}{nsitTab && location.pathname === '/nsit' && <span className="text-samurai-steel font-normal ml-1.5">{nsitTab}</span>}
            </div>
          )}

          {/* Right side buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {appConfig ? (
              <>
                {/* README Button — handled directly in Footer to avoid multi-popup bug */}
                <button
                  onClick={() => setShowReadme(true)}
                  className="w-7 h-7 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all"
                  aria-label="README"
                  title="README"
                >
                  <BookOpen size={14} />
                </button>
                {/* Settings Button */}
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('rmg:settings'))}
                  className="w-7 h-7 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all"
                  aria-label="Settings"
                  title="Settings"
                >
                  <Settings size={14} />
                </button>
                {/* Embers Toggle */}
                <button
                  onClick={toggleEmbers}
                  className={`w-7 h-7 steel-texture rounded-lg flex items-center justify-center transition-all ${
                    embersOn
                      ? 'text-orange-400 hover:bg-orange-500 hover:text-white'
                      : 'text-samurai-steel hover:bg-samurai-grey hover:text-white'
                  }`}
                  aria-label="Toggle embers"
                  title={embersOn ? 'Embers: ON' : 'Embers: OFF'}
                >
                  <Flame size={14} />
                </button>
              </>
            ) : (
              <>
                <a 
                  href="https://github.com/54MUR-AI" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-7 h-7 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all"
                  aria-label="GitHub"
                >
                  <Github size={14} />
                </a>
              </>
            )}
          </div>
        </div>
      </div>
      {/* README Popup — single instance, keyed to current app */}
      {showReadme && appConfig && (
        <ReadmePopup
          readmeUrl={appConfig.readme}
          onClose={() => setShowReadme(false)}
        />
      )}
    </footer>
  )
}
