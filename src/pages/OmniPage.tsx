import { useState, useEffect } from 'react'
import ReadmePopup from '../components/ReadmePopup'

export default function OmniPage() {
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="bg-samurai-black">
      {/* README Popup */}
      {showPopup && (
        <ReadmePopup
          readmeUrl="https://raw.githubusercontent.com/54MUR-AI/omni_lite/main/README.md"
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Fullscreen iframe */}
      <iframe
        src="https://omni-lite-web.onrender.com"
        className="w-full h-screen border-none"
        title="OMNI-Lite - Optimized Multi-Model Networked Intelligence"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        style={{
          colorScheme: 'light only',
          filter: 'none',
          WebkitFilter: 'none'
        }}
      />
    </div>
  )
}
