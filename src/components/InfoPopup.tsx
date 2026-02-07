import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface InfoPopupProps {
  title: string
  subtitle: string
  description: string
  features: string[]
  icon: ReactNode
  thumbnail: string
  onClose: () => void
}

export default function InfoPopup({ title, subtitle, description, features, icon, thumbnail, onClose }: InfoPopupProps) {
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY
    
    // Lock body scroll
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    
    // Cleanup: restore scroll
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [])

  return (
    <div 
      className="bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      style={{ 
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        className="bg-samurai-grey-darker border-2 border-samurai-red rounded-2xl w-full flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '48rem',
          maxHeight: '90vh'
        }}
      >
        <div className="flex-shrink-0 bg-samurai-grey-darker border-b-2 border-samurai-steel-dark p-4 sm:p-6 flex items-center justify-between gap-3 rounded-t-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 steel-texture rounded-2xl flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white truncate">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-samurai-red/20 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="text-white" size={24} />
          </button>
        </div>
        
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {/* Subtitle */}
          <p className="text-sm sm:text-base text-samurai-red font-bold tracking-wider mb-4">{subtitle}</p>
          
          {/* Thumbnail Preview */}
          <div className="mb-6 rounded-xl overflow-hidden border-2 border-samurai-steel-dark">
            <img 
              src={thumbnail} 
              alt={`${title} UI Preview`} 
              className="w-full h-48 sm:h-64 object-cover"
            />
          </div>
          
          {/* Description */}
          <p className="text-sm sm:text-base text-white/90 mb-6 leading-relaxed">{description}</p>
          
          <h3 className="text-lg sm:text-xl font-bold text-samurai-red mb-4">Key Features</h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-samurai-red rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span className="text-sm sm:text-base text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
