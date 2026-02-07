import { useState, useEffect } from 'react'
import ReadmePopup from '../components/ReadmePopup'

export default function StonksPage() {
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* README Popup */}
      {showPopup && (
        <ReadmePopup
          title="STONKS"
          readmeUrl="https://raw.githubusercontent.com/54MUR-AI/stonks/main/README.md"
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Fullscreen iframe */}
      <iframe
        src="https://stonks-app.onrender.com"
        className="w-full h-screen border-none"
        title="STONKS Application"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
