import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ReadmePopup from '../components/ReadmePopup'

export default function WsprPage() {
  const { user } = useAuth()
  const [showReadme, setShowReadme] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setShowReadme(true)
  }, [])

  if (!user) {
    return (
      <div className="bg-samurai-black flex items-center justify-center p-4 py-32">
        <div className="text-center">
          <Lock className="w-16 h-16 text-samurai-red mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2 neon-text">WSPR</h2>
          <p className="text-white/70 mb-6">Please sign in to access WSPR</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-samurai-black">
      {showReadme && (
        <ReadmePopup
          readmeUrl="https://raw.githubusercontent.com/54MUR-AI/wspr-web/main/README.md"
          onClose={() => setShowReadme(false)}
        />
      )}
      
      {/* Placeholder content when popup is closed */}
      {!showReadme && (
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-black text-samurai-red mb-6 neon-text">WSPR</h1>
          <p className="text-xl text-white/80 mb-8">Web-Secure P2P Relay</p>
          <button
            onClick={() => setShowReadme(true)}
            className="px-8 py-4 bg-samurai-red text-white rounded-xl font-bold hover:bg-samurai-red-dark transition-all"
          >
            View Documentation
          </button>
        </div>
      )}
    </div>
  )
}
