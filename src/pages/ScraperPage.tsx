import { useState, useEffect } from 'react'
import ReadmePopup from '../components/ReadmePopup'
import FloatingEmbers from '../components/FloatingEmbers'

export default function ScraperPage() {
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* Floating embers - fixed to viewport */}
      <FloatingEmbers />

      {/* README Popup */}
      {showPopup && (
        <ReadmePopup
          title="SCRP"
          readmeUrl="https://raw.githubusercontent.com/54MUR-AI/scraper/main/README.md"
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Fullscreen iframe */}
      <iframe
        src="https://scraper-frontend-3hnj.onrender.com"
        className="w-full h-screen border-none"
        title="SCRP - Smart Content Retrieval & Processing"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
