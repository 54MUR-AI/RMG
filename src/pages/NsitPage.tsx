import { useEffect, useRef } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export default function NsitPage() {
  const { user } = useAuth()
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (!user) return

    // Send a fresh auth token to the iframe via getSession()
    const sendAuthToken = async () => {
      if (!iframeRef.current?.contentWindow) return

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const authToken = JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
        iframeRef.current.contentWindow.postMessage(
          { type: 'RMG_AUTH_TOKEN', authToken },
          'https://nsit-rmg.onrender.com'
        )
      }
    }

    // Listen for auth refresh requests from the NSIT iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://nsit-rmg.onrender.com') return
      if (event.data?.type === 'NSIT_REQUEST_AUTH') {
        sendAuthToken()
      }
    }
    window.addEventListener('message', handleMessage)

    // Send token when iframe loads
    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', sendAuthToken)
    }

    return () => {
      window.removeEventListener('message', handleMessage)
      if (iframe) {
        iframe.removeEventListener('load', sendAuthToken)
      }
    }
  }, [user])

  // Listen for footer settings button
  useEffect(() => {
    const onSettings = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { type: 'RMG_TOGGLE_SETTINGS' },
          'https://nsit-rmg.onrender.com'
        )
      }
    }
    window.addEventListener('rmg:settings', onSettings)
    return () => {
      window.removeEventListener('rmg:settings', onSettings)
    }
  }, [])

  if (!user) {
    return (
      <div className="bg-samurai-black flex items-center justify-center p-4 py-32">
        <div className="text-center">
          <Lock className="w-16 h-16 text-samurai-red mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2 neon-text">N-SIT</h2>
          <p className="text-white/70 mb-6">Please sign in to access N-SIT</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-samurai-black h-full">
      {/* Fullscreen iframe */}
      <iframe
        ref={iframeRef}
        src="https://nsit-rmg.onrender.com"
        className="w-full h-full border-none"
        title="N-SIT - Networked - Strategic Intelligence Tool"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />

    </div>
  )
}
