import { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ReadmePopup from '../components/ReadmePopup'

export default function StonksPage() {
  const { user } = useAuth()
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Listen for footer button events
  useEffect(() => {
    const onReadme = () => setShowPopup(true)
    window.addEventListener('rmg:readme', onReadme)
    return () => {
      window.removeEventListener('rmg:readme', onReadme)
    }
  }, [])

  if (!user) {
    return (
      <div className="bg-samurai-black flex items-center justify-center p-4 py-32">
        <div className="text-center">
          <Lock className="w-16 h-16 text-samurai-red mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2 neon-text">STONKS</h2>
          <p className="text-white/70 mb-6">Please sign in to access STONKS</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-samurai-black">
      {/* README Popup */}
      {showPopup && (
        <ReadmePopup
          readmeUrl="https://raw.githubusercontent.com/54MUR-AI/stonks/main/README.md"
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Fullscreen iframe */}
      <iframe
        src="https://stonks-app.onrender.com"
        className="w-full h-full border-none"
        title="STONKS - Smart Trading Options for Novices & Knowledgeable Speculators"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
