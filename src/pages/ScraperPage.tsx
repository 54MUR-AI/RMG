import { useEffect, useRef, useState } from 'react'
import { Lock } from 'lucide-react'
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
          'https://scrp-rmg.onrender.com'
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

  // Listen for footer button events
  useEffect(() => {
    const onReadme = () => setShowReadme(true)
    const onSettings = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'RMG_TOGGLE_SETTINGS' },
          'https://scrp-rmg.onrender.com'
        )
      }
    }
    window.addEventListener('rmg:readme', onReadme)
    window.addEventListener('rmg:settings', onSettings)
    return () => {
      window.removeEventListener('rmg:readme', onReadme)
      window.removeEventListener('rmg:settings', onSettings)
    }
  }, [])

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
    <div className="relative bg-samurai-black h-full">
      {/* Fullscreen iframe */}
      <iframe
        ref={iframeRef}
        src="https://scrp-rmg.onrender.com"
        className="w-full h-full border-none"
        title="SCRP - Smart Content Retrieval & Processing"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

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
