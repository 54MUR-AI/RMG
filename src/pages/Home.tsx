import { Sparkles, Zap, Flame, Hammer, Anvil, Code2, Database, Container, Server, Cpu, Palette, Layout, Wrench, Bot, MessageSquare, Network } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CrossedKatanasIcon from '../components/CrossedKatanasIcon'
import DiscordIcon from '../components/DiscordIcon'
import ReadmePopup from '../components/ReadmePopup'
import AuthPopup from '../components/AuthPopup'
import ArsenalCard from '../components/home/ArsenalCard'
import { ARSENAL_CARDS } from '../components/home/arsenalData'
import Forum from '../components/Forum'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

export default function Home() {
  const [readmePopup, setReadmePopup] = useState<{ title: string; url: string } | null>(null)
  const [featuredCard, setFeaturedCard] = useState<string | null>('OMNI')
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const handleLaunchClick = (e: React.MouseEvent, path: string) => {
    e.stopPropagation()
    if (!user) {
      setShowAuthPopup(true)
    } else {
      navigate(path)
    }
  }

  const getCardOrder = (cardName: string) => {
    if (!featuredCard) return 0
    if (cardName === featuredCard) return 2
    const allCards = ARSENAL_CARDS.map(c => c.name)
    const otherCards = allCards.filter(c => c !== featuredCard)
    const positions = [1, 3, 4, 6]
    const orderMap: Record<string, number> = {}
    otherCards.forEach((card, idx) => { orderMap[card] = positions[idx] })
    return orderMap[cardName] || 0
  }

  return (
    <div className="bg-samurai-black">
      {/* Epic Hero Section with Parallax */}
      <section className="gradient-bg text-white py-16 sm:py-24 md:py-32 relative">
        
        {/* Animated background elements */}
        <div className="absolute inset-0 pattern-bg opacity-10"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-samurai-red rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-samurai-red-dark rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            {/* Crossed Katanas logo with animation */}
            <div className="flex justify-center mb-8 relative" style={{ zIndex: 10, transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
              <CrossedKatanasIcon 
                size={192}
                className="text-white drop-shadow-[0_0_25px_rgba(230,57,70,1)] animate-flame-pulse-big"
              />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 neon-text tracking-tight">
              RONIN MEDIA
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6 font-bold text-white px-4 uppercase tracking-wide">
              Digital Damascus for the Cyber Samurai
            </p>
            
            <p className="text-base sm:text-lg mb-8 sm:mb-12 max-w-3xl mx-auto text-white/90 leading-relaxed px-4 uppercase font-bold tracking-wide">
              No masters, no compromises, just powerful tools
            </p>
            
            <div className="flex justify-center px-4">
              <a
                href="https://discord.gg/EHcZ5PZ877"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center px-10 sm:px-14 py-4 sm:py-5 bg-samurai-red text-white rounded-2xl font-black text-lg sm:text-xl hover:bg-white hover:text-samurai-red transition-all duration-300 transform hover:scale-110 shadow-2xl shadow-samurai-red/50 hover:shadow-white/50 border-2 border-white/20 hover:border-samurai-red touch-manipulation uppercase tracking-wider"
              >
                <DiscordIcon className="mr-3 group-hover:rotate-12 transition-transform duration-300" size={28} />
                Enter the Dojo
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom wave separator */}
        <div className="absolute bottom-0 left-0 right-0 -mb-1">
          <svg className="block w-full" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#0A0A0A"/>
          </svg>
        </div>
      </section>

      {/* Arsenal Section - Our Weapons */}
      <section id="arsenal" className="py-24 bg-samurai-black relative">
        {/* Background effects */}
        <div className="absolute inset-0 pattern-bg opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="mb-6 relative" style={{ zIndex: 10, transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
              <Hammer size={80} className="text-samurai-red mx-auto animate-flame-flicker" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 neon-text">
              ARSENAL
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4 uppercase font-bold tracking-wide">
              AI-driven automation for the independent developer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr] lg:grid-rows-2 gap-6 mb-12 lg:auto-rows-fr">
            {ARSENAL_CARDS.map((card) => (
              <ArsenalCard
                key={card.name}
                card={card}
                isFeatured={featuredCard === card.name}
                order={getCardOrder(card.name)}
                onSelect={() => setFeaturedCard(card.name)}
                onLaunch={handleLaunchClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Technology Forge Section */}
      <section className="py-24 bg-samurai-grey-darker relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div id="forge" className="text-center mb-16">
            <div className="mb-6 relative" style={{ zIndex: 10, transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
              <Anvil size={80} className="text-samurai-red mx-auto animate-flame-flicker" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              FORGE
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto uppercase font-bold tracking-wide">
              Where the community meets the code
            </p>
          </div>

          {/* Forge Forum */}
          <div className="mb-16">
            <Forum />
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-samurai-black rounded-2xl p-8 border-2 border-samurai-steel-dark hover:border-samurai-red transition-all duration-300 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 steel-texture rounded-xl flex items-center justify-center mr-3">
                  <Sparkles className="text-samurai-red" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white">Backend</h3>
              </div>
              <div className="flex items-center justify-around gap-6">
                <div className="relative group">
                  <Code2 className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Python 3.13 & FastAPI
                  </div>
                </div>
                <div className="relative group">
                  <Cpu className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    TensorFlow & PyTorch
                  </div>
                </div>
                <div className="relative group">
                  <Database className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    SQLAlchemy & Redis
                  </div>
                </div>
                <div className="relative group">
                  <Container className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Docker & Kubernetes
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-samurai-black rounded-2xl p-8 border-2 border-samurai-steel-dark hover:border-samurai-red transition-all duration-300 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 steel-texture rounded-xl flex items-center justify-center mr-3">
                  <Zap className="text-samurai-red" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white">Frontend</h3>
              </div>
              <div className="flex items-center justify-around gap-6">
                <div className="relative group">
                  <Layout className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    React & TypeScript
                  </div>
                </div>
                <div className="relative group">
                  <Server className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Redux Toolkit
                  </div>
                </div>
                <div className="relative group">
                  <Palette className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    TailwindCSS
                  </div>
                </div>
                <div className="relative group">
                  <Zap className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Vite Build Tool
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-samurai-black rounded-2xl p-8 border-2 border-samurai-steel-dark hover:border-samurai-red transition-all duration-300 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 steel-texture rounded-xl flex items-center justify-center mr-3">
                  <Flame className="text-samurai-red animate-flame-flicker" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white">AI & ML</h3>
              </div>
              <div className="flex items-center justify-around gap-6">
                <div className="relative group">
                  <MessageSquare className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    OpenAI GPT-4
                  </div>
                </div>
                <div className="relative group">
                  <Bot className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Anthropic Claude
                  </div>
                </div>
                <div className="relative group">
                  <Network className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    HuggingFace Models
                  </div>
                </div>
                <div className="relative group">
                  <Wrench className="text-samurai-red group-hover:scale-125 transition-transform cursor-pointer" size={44} />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-samurai-black border border-samurai-red rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Custom ML Pipelines
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* README Popup */}
      {readmePopup && (
        <ReadmePopup
          readmeUrl={readmePopup.url}
          onClose={() => setReadmePopup(null)}
        />
      )}
      
      {/* Auth Popup */}
      {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}
    </div>
  )
}
