import { useState, useEffect } from 'react'
import { Shield, Loader2, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function WsprPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only check health if user is authenticated
    if (!user) return

    // Check if WSPR backend is healthy
    const checkHealth = async () => {
      try {
        const response = await fetch('https://wspr-backend.onrender.com/api/health')
        if (response.ok) {
          setIsLoading(false)
        } else {
          setError('WSPR service is currently unavailable')
          setIsLoading(false)
        }
      } catch (err) {
        // Service might be spinning up on Render free tier
        setIsLoading(false)
      }
    }

    checkHealth()
  }, [user])

  // Auth gate - require login
  if (!user) {
    return (
      <div className="min-h-screen bg-samurai-black flex items-center justify-center p-4">
        <div className="glass-card p-12 rounded-xl max-w-md text-center">
          <Lock className="w-20 h-20 text-samurai-red mx-auto mb-6 animate-glow-pulse" />
          <h1 className="text-4xl font-bold neon-text mb-4">WSPR</h1>
          <p className="text-xl text-samurai-steel mb-6">Web Secure P2P Relay</p>
          <p className="text-samurai-steel-light mb-8">
            WSPR is a secure, encrypted messaging platform exclusively for RMG members.
          </p>
          <div className="bg-samurai-black-lighter border border-samurai-red/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-samurai-steel">
              🔒 End-to-end encryption<br/>
              🛡️ Quantum-resistant security<br/>
              📁 LDGR file integration<br/>
              🎥 Video/voice calls
            </p>
          </div>
          <p className="text-samurai-red font-semibold">
            Please sign in to access WSPR
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-samurai-black">
      {/* Header */}
      <div className="bg-samurai-black-light border-b border-samurai-grey-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-samurai-red" />
            <div>
              <h1 className="text-2xl font-bold neon-text">WSPR</h1>
              <p className="text-sm text-samurai-steel">Web Secure P2P Relay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-samurai-red animate-spin mx-auto mb-4" />
            <p className="text-samurai-steel">Connecting to WSPR...</p>
            <p className="text-xs text-samurai-steel-dark mt-2">
              (Free tier services may take 30-60s to spin up)
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="glass-card p-8 rounded-xl max-w-md text-center">
            <Shield className="w-16 h-16 text-samurai-red mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Service Unavailable</h2>
            <p className="text-samurai-steel mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* WSPR Iframe */}
      {!isLoading && !error && user && (
        <div className="h-[calc(100vh-200px)]">
          <iframe
            src={`https://wspr-web.onrender.com?userId=${user.id}&email=${encodeURIComponent(user.email || '')}`}
            className="w-full h-full border-0"
            title="WSPR - Web Secure P2P Relay"
            allow="camera; microphone; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        </div>
      )}

      {/* Footer Info */}
      <div className="bg-samurai-black-light border-t border-samurai-grey-dark py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-samurai-steel text-center">
            End-to-end encrypted messaging • Quantum-resistant security • Privacy-first communication
          </p>
        </div>
      </div>
    </div>
  )
}
