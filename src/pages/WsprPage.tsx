import { useState, useEffect } from 'react'
import ReadmePopup from '../components/ReadmePopup'

export default function WsprPage() {
  const [showReadme, setShowReadme] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
    setShowReadme(true)
  }, [])

  return (
    <div className="min-h-screen bg-samurai-black">
      {showReadme && (
        <ReadmePopup
          title="WSPR"
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
