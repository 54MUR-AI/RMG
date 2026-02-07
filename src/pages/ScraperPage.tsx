import { useState } from 'react'
import AppInfoPopup from '../components/AppInfoPopup'

export default function ScraperPage() {
  const [showPopup, setShowPopup] = useState(true)

  const features = [
    'Scrape articles from Medium, Substack, blogs, and news sites',
    'Extract YouTube video transcripts automatically',
    'Parse PDF documents and research papers',
    'AI-powered summarization with multiple providers',
    'Support for OpenAI, Anthropic, HuggingFace, and Ollama',
    'Beautiful web interface with real-time processing',
  ]

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* Info Popup */}
      {showPopup && (
        <AppInfoPopup
          title="Web Scraper & Summarizer"
          description="Beautiful web interface for scraping and summarizing any web content with AI"
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
