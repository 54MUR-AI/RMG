import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface AppInfoPopupProps {
  title: string
  description: string
  features: string[]
  githubUrl: string
  onClose: () => void
}

export default function AppInfoPopup({ title, description, features, githubUrl, onClose }: AppInfoPopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(onClose, 300) // Wait for fade out animation
  }

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(10, 10, 10, 0.85)' }}
    >
      <div 
        className={`relative max-w-2xl w-full bg-samurai-grey-darker border-2 border-samurai-red rounded-2xl p-8 shadow-2xl shadow-samurai-red/50 transform transition-all duration-300 ${
          isVisible ? 'scale-100' : 'scale-95'
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-white hover:text-samurai-red transition-colors rounded-lg hover:bg-samurai-red/10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-black text-samurai-red mb-3 uppercase neon-text">{title}</h2>
          <p className="text-base text-white/90 whitespace-nowrap overflow-hidden text-ellipsis">{description}</p>
        </div>

        {/* Features */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4 uppercase">Key Features:</h3>
          <ul className="space-y-2 text-white/80">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="text-samurai-red mr-2">▸</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-center">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 border-2 border-samurai-red text-samurai-red rounded-xl font-bold hover:bg-samurai-red hover:text-white transition-all"
          >
            View Source
          </a>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          Note: First load may take ~30 seconds as the free tier spins up
        </p>
      </div>
    </div>
  )
}
