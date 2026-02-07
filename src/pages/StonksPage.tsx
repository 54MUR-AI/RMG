import { useState, useEffect } from 'react'
import AppInfoPopup from '../components/AppInfoPopup'

export default function StonksPage() {
  const [showPopup, setShowPopup] = useState(true)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const features = [
    'Advanced ML models: LSTM, Transformer, WaveNet, Graph Neural Networks',
    'Real-time market data processing with technical indicators',
    'Portfolio optimization with modern portfolio theory algorithms',
    'Automated rebalancing and risk management',
    'Production infrastructure with Docker containerization',
    'Comprehensive testing and security scanning',
  ]

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* Info Popup */}
      {showPopup && (
        <AppInfoPopup
          title="STONKS"
          description="Smart Trading Options for Novices & Knowledgeable Speculators"
          features={features}
          githubUrl="https://github.com/54MUR-AI/stonks"
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
