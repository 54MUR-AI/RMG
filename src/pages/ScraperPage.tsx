import { useState, useEffect } from 'react'
import AppInfoPopup from '../components/AppInfoPopup'

export default function ScraperPage() {
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const features = [
    'Multi-source scraping: Articles, YouTube videos, PDFs, and web pages',
    'AI-powered summarization with GPT-4, Claude, or HuggingFace',
    'Automatic key points extraction from content',
    'Batch processing for multiple URLs at once',
    'Beautiful web interface with real-time results',
    'Enhanced anti-bot detection bypass for major news sites',
  ]

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* Info Popup */}
      {showPopup && (
        <AppInfoPopup
          title="SCRP"
          description="Smart Content Retrieval & Processing - AI-powered content extraction"
          features={features}
          githubUrl="https://github.com/54MUR-AI/scraper"
          onClose={() => setShowPopup(false)}
        />
      )}

      {/* Fullscreen iframe */}
      <iframe
        src="https://scraper-frontend-3hnj.onrender.com"
        className="w-full h-screen border-none"
        title="Scraper Web Application"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}
