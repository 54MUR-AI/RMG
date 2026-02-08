import { useState, useEffect } from 'react'
import ReadmePopup from '../components/ReadmePopup'

export default function StonksPage() {
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
        className="w-full h-screen border-none"
        title="STONKS - Smart Trading Options for Novices & Knowledgeable Speculators"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
