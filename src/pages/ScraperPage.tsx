import { useEffect, useRef, useState } from 'react'
import { BookOpen, Settings, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ReadmePopup from '../components/ReadmePopup'

export default function ScraperPage() {
  const { user } = useAuth()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [showReadme, setShowReadme] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)

    // Send auth token to iframe when it loads
    const sendAuthToken = () => {
      if (!iframeRef.current) return

      // Try to get auth token from localStorage
      const possibleKeys = [
        'sb-meqfiyuaxgwbstcdmjgz-auth-token',
        'supabase.auth.token',
        'sb-auth-token'
      ]

      let authToken = null
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (parsed.access_token || parsed.token) {
              authToken = data
              break
            }
          } catch (e) {
            continue
          }
        }
      }

      if (authToken && iframeRef.current.contentWindow) {
        // Send auth token to iframe
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'RMG_AUTH_TOKEN',
            authToken: authToken
          },
          'https://scraper-frontend-3hnj.onrender.com'
        )
      }
    }

    // Send token when iframe loads
    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', sendAuthToken)
      return () => iframe.removeEventListener('load', sendAuthToken)
    }
  }, [])

  // Send settings toggle to iframe
  const handleSettingsClick = () => {
    console.log('Settings button clicked in RMG')
    if (iframeRef.current?.contentWindow) {
      console.log('Sending RMG_TOGGLE_SETTINGS to SCRP iframe')
      iframeRef.current.contentWindow.postMessage(
        { type: 'RMG_TOGGLE_SETTINGS' },
        'https://scraper-frontend-3hnj.onrender.com'
      )
      console.log('Message sent')
    } else {
      console.error('Iframe contentWindow not available')
    }
  }

  if (!user) {
    return (
      <div className="bg-samurai-black flex items-center justify-center p-4 py-32">
        <div className="text-center">
          <Lock className="w-16 h-16 text-samurai-red mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2 neon-text">SCRP</h2>
          <p className="text-white/70 mb-6">Please sign in to access the scraper</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-samurai-black h-screen">
      {/* Fullscreen iframe */}
      <iframe
        ref={iframeRef}
        src="https://scraper-frontend-3hnj.onrender.com"
        className="w-full h-full border-none"
        title="SCRP - Smart Content Retrieval & Processing"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

      {/* Floating Buttons */}
      <div className="fixed bottom-20 right-6 flex flex-col gap-3 z-50">
        {/* README Button */}
        <button
          onClick={() => setShowReadme(true)}
          className="p-4 bg-samurai-grey-dark text-white rounded-full shadow-lg hover:bg-samurai-red transition-all hover:scale-110"
          aria-label="README"
        >
          <BookOpen className="w-6 h-6" />
        </button>
        
        {/* Settings Button */}
        <button
          onClick={handleSettingsClick}
          className="p-4 bg-samurai-red text-white rounded-full shadow-lg shadow-samurai-red/50 hover:bg-samurai-red-dark transition-all hover:scale-110"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* README Popup */}
      {showReadme && (
        <ReadmePopup
          readmeUrl="https://raw.githubusercontent.com/54MUR-AI/scraper/main/README.md"
          onClose={() => setShowReadme(false)}
        />
      )}
    </div>
  )
}
