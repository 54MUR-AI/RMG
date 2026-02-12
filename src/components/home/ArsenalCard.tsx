import { Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ArsenalCardData {
  name: string
  subtitle: string
  icon: LucideIcon
  thumbnail: string
  path: string
  shortDescription: string
  longDescription: string[]
  features: string[]
}

interface ArsenalCardProps {
  card: ArsenalCardData
  isFeatured: boolean
  order: number
  onSelect: () => void
  onLaunch: (e: React.MouseEvent, path: string) => void
}

export default function ArsenalCard({ card, isFeatured, order, onSelect, onLaunch }: ArsenalCardProps) {
  const Icon = card.icon

  return (
    <div
      className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ease-in-out ${
        isFeatured ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
      }`}
      style={{ order: window.innerWidth >= 1024 ? order : 0, transition: 'order 0s' }}
      onClick={onSelect}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative z-20 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
            <Icon className="text-white group-hover:text-samurai-red transition-colors" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
              {card.name}
            </h3>
            <p className="text-xs text-samurai-red font-bold tracking-wider">{card.subtitle}</p>
          </div>
        </div>

        {/* Thumbnail */}
        <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark bg-samurai-grey-dark ${
          isFeatured ? 'h-48' : 'h-32'
        }`}>
          <img
            src={card.thumbnail}
            alt={`${card.name} UI Preview`}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Expanded Description */}
        {isFeatured && (
          <div className="mb-4 animate-fade-in">
            {card.longDescription.map((paragraph, idx) => (
              <p key={idx} className="text-white/90 mb-4 text-sm leading-relaxed">
                {paragraph}
              </p>
            ))}
            <h4 className="text-sm font-bold text-samurai-red mb-2">Key Features:</h4>
            <ul className="space-y-1 mb-4">
              {card.features.map((feature, idx) => (
                <li key={idx} className="flex items-start text-xs text-white/80">
                  <span className="w-1.5 h-1.5 bg-samurai-red rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Compact Description */}
        {!isFeatured && (
          <p className="text-white/80 mb-4 text-sm leading-relaxed flex-1">
            {card.shortDescription}
          </p>
        )}

        <button
          onClick={(e) => onLaunch(e, card.path)}
          className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
        >
          <Zap className="mr-2" size={18} />
          Launch
        </button>
      </div>
    </div>
  )
}
