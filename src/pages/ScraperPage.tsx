import { useEffect, useRef } from 'react'

export default function ScraperPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)

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

  return (
    <div className="bg-samurai-black">
      {/* Fullscreen iframe */}
      <iframe
        ref={iframeRef}
        src="https://scraper-frontend-3hnj.onrender.com"
        className="w-full h-screen border-none"
        title="SCRP - Smart Content Retrieval & Processing"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
