import { useState } from 'react'
import AppInfoPopup from '../components/AppInfoPopup'

export default function StonksPage() {
  const [showPopup, setShowPopup] = useState(true)

  const features = [
    'Advanced ML models: LSTM, Transformer, WaveNet, GNN',
    'Real-time news intelligence with AI summarization',
    'Portfolio optimization with risk parity & Black-Litterman',
    'Automated rebalancing and trading execution',
    'Production-ready infrastructure with Docker & Kubernetes',
    'Real-time WebSocket streaming for market data',
  ]

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* Info Popup */}
      {showPopup && (
        <AppInfoPopup
          title="STONKS"
          description="Advanced Financial Machine Learning Platform with News Intelligence"
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
