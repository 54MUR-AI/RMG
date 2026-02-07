import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface InfoPopupProps {
  title: string
  features: string[]
  icon: ReactNode
  thumbnail: string
  onClose: () => void
}

export default function InfoPopup({ title, features, icon, thumbnail, onClose }: InfoPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
        <div className="sticky top-0 bg-samurai-grey-darker border-b-2 border-samurai-steel-dark p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 steel-texture rounded-2xl flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
            <h2 className="text-3xl font-black text-white">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-samurai-red/20 rounded-lg transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X className="text-white" size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Thumbnail Preview */}
          <div className="mb-6 rounded-xl overflow-hidden border-2 border-samurai-steel-dark">
            <img 
              src={thumbnail} 
              alt={`${title} UI Preview`} 
              className="w-full h-64 object-cover"
            />
          </div>
          
          <h3 className="text-xl font-bold text-samurai-red mb-4">Key Features</h3>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start">
                <div className="w-2 h-2 bg-samurai-red rounded-full mr-3 mt-2 flex-shrink-0"></div>
                <span className="text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
