import { TrendingUp, FileText, Sparkles, Zap, Flame, Hammer, Lock, Info, Brain } from 'lucide-react'
import { Link } from 'react-router-dom'
import FloatingEmbers from '../components/FloatingEmbers'
import CrossedKatanasIcon from '../components/CrossedKatanasIcon'
import DiscordIcon from '../components/DiscordIcon'
import ReadmePopup from '../components/ReadmePopup'
import InfoPopup from '../components/InfoPopup'
import { useState } from 'react'

export default function Home() {
  const [readmePopup, setReadmePopup] = useState<{ title: string; url: string } | null>(null)
  const [infoPopup, setInfoPopup] = useState<{ title: string; features: string[]; icon: React.ReactNode; thumbnail: string } | null>(null)

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* Floating embers - spans entire page */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }}>
        <FloatingEmbers />
      </div>
      
      {/* Epic Hero Section with Parallax */}
      <section className="gradient-bg text-white py-16 sm:py-24 md:py-32 relative overflow-hidden">
        
        {/* Animated background elements */}
        <div className="absolute inset-0 pattern-bg opacity-10"></div>
        <div className="absolute top-20 left-10 w-64 h-64 bg-samurai-red rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-samurai-red-dark rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center animate-slide-up">
            {/* Flame icon with animation */}
            <div className="flex justify-center mb-8 relative" style={{ zIndex: 10, transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
              <Flame className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(230,57,70,0.7)] animate-flame-pulse-big" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 neon-text tracking-tight">
              RONIN MEDIA
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6 font-bold text-white px-4">
              Digital Damascus for the Cyber Samurai
            </p>
            
            <p className="text-base sm:text-lg mb-8 sm:mb-12 max-w-3xl mx-auto text-white/90 leading-relaxed px-4">
              Like masterless samurai, we walk our own path—crafting cutting-edge software 
              that wields the power of artificial intelligence, machine learning, and advanced 
              automation to conquer real-world challenges.
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
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#0A0A0A"/>
          </svg>
        </div>
      </section>

      {/* Arsenal Section - Our Weapons */}
      <section id="arsenal" className="py-24 bg-samurai-black relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pattern-bg opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="mb-6 relative" style={{ zIndex: 10, transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
              <CrossedKatanasIcon size={80} className="text-samurai-red mx-auto animate-flame-flicker" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 neon-text">
              THE ARSENAL
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4">
              Battle-tested tools forged in the fires of innovation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* OMNI Card */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                      <Brain className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                        OMNI
                      </h3>
                      <p className="text-xs text-samurai-red font-bold tracking-wider">Optimized Multi-Model Networked Intelligence</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInfoPopup({ 
                      title: 'OMNI', 
                      icon: <Brain className="text-samurai-red" size={32} />,
                      thumbnail: '/thumbnails/omni-thumb.svg',
                      features: [
                        'Multiple AI Models (Ollama, Claude, GPT, Grok)',
                        'PyQt6 Desktop Application',
                        'Plugin System with Marketplace',
                        'Text-to-Speech & Audio Capabilities',
                        'Vector Database Integration',
                        'Code Editor with Syntax Highlighting'
                      ]
                    })}
                    className="p-2 hover:bg-samurai-red/20 rounded-lg transition-colors"
                  >
                    <Info className="text-samurai-red" size={20} />
                  </button>
                </div>
                
                {/* Thumbnail */}
                <div className="mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark">
                  <img 
                    src="/thumbnails/omni-thumb.svg" 
                    alt="OMNI UI Preview" 
                    className="w-full h-32 object-cover"
                  />
                </div>
                
                <p className="text-white/80 mb-4 text-sm leading-relaxed">
                  Comprehensive AI dashboard providing multi-model interaction, plugin management, and performance monitoring.
                </p>
                
                <Link
                  to="/omni"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>

            {/* SCRP Card */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                      <FileText className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                        SCRP
                      </h3>
                      <p className="text-xs text-samurai-red font-bold tracking-wider">Smart Content Retrieval & Processing</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInfoPopup({ 
                      title: 'SCRP', 
                      icon: <FileText className="text-samurai-red" size={32} />,
                      thumbnail: '/thumbnails/scrp-thumb.svg',
                      features: [
                        'Multi-Source Scraping (Articles, Videos, PDFs)',
                        'AI Summarization (GPT-4, Claude, Ollama)',
                        'Key Points Extraction & Analysis',
                        'High-Speed Batch Processing'
                      ]
                    })}
                    className="p-2 hover:bg-samurai-red/20 rounded-lg transition-colors"
                  >
                    <Info className="text-samurai-red" size={20} />
                  </button>
                </div>
                
                {/* Thumbnail */}
                <div className="mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark">
                  <img 
                    src="/thumbnails/scrp-thumb.svg" 
                    alt="SCRP UI Preview" 
                    className="w-full h-32 object-cover"
                  />
                </div>
                
                <p className="text-white/80 mb-4 text-sm leading-relaxed">
                  AI-powered content extraction and summarization that transforms articles, videos, and PDFs into actionable intelligence.
                </p>
                
                <Link
                  to="/scraper"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>

            {/* LDGR Card */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                      <Lock className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                        LDGR
                      </h3>
                      <p className="text-xs text-samurai-red font-bold tracking-wider">Layered Data Gateway & Repository</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInfoPopup({ 
                      title: 'LDGR', 
                      icon: <Lock className="text-samurai-red" size={32} />,
                      thumbnail: '/thumbnails/ldgr-thumb.svg',
                      features: [
                        'Blockchain Integration (Ethereum/Hardhat)',
                        'AES/RSA High-Level Encryption',
                        'Smart Contract Data Transactions',
                        'User-Friendly Database Management'
                      ]
                    })}
                    className="p-2 hover:bg-samurai-red/20 rounded-lg transition-colors"
                  >
                    <Info className="text-samurai-red" size={20} />
                  </button>
                </div>
                
                {/* Thumbnail */}
                <div className="mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark">
                  <img 
                    src="/thumbnails/ldgr-thumb.svg" 
                    alt="LDGR UI Preview" 
                    className="w-full h-32 object-cover"
                  />
                </div>
                
                <p className="text-white/80 mb-4 text-sm leading-relaxed">
                  Blockchain-powered database management with military-grade encryption and immutable data storage.
                </p>
                
                <Link
                  to="/ldgr"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>

            {/* WSPR Card */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                      <Zap className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                        WSPR
                      </h3>
                      <p className="text-xs text-samurai-red font-bold tracking-wider">Web-Secure P2P Relay</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInfoPopup({ 
                      title: 'WSPR', 
                      icon: <Zap className="text-samurai-red" size={32} />,
                      thumbnail: '/thumbnails/wspr-thumb.svg',
                      features: [
                        'End-to-End AES-GCM Encryption',
                        'Real-Time Encrypted Messaging',
                        'Two-Factor Authentication (2FA)',
                        'React + TypeScript + PostgreSQL'
                      ]
                    })}
                    className="p-2 hover:bg-samurai-red/20 rounded-lg transition-colors"
                  >
                    <Info className="text-samurai-red" size={20} />
                  </button>
                </div>
                
                {/* Thumbnail */}
                <div className="mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark">
                  <img 
                    src="/thumbnails/wspr-thumb.svg" 
                    alt="WSPR UI Preview" 
                    className="w-full h-32 object-cover"
                  />
                </div>
                
                <p className="text-white/80 mb-4 text-sm leading-relaxed">
                  Privacy-focused encrypted communication platform with end-to-end encryption and perfect forward secrecy.
                </p>
                
                <Link
                  to="/wspr"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>

            {/* STONKS Card */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                      <TrendingUp className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                        STONKS
                      </h3>
                      <p className="text-xs text-samurai-red font-bold tracking-wider">Smart Trading Options <span className="lowercase">for</span> Novices & Knowledgeable Speculators</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setInfoPopup({ 
                      title: 'STONKS', 
                      icon: <TrendingUp className="text-samurai-red" size={32} />,
                      thumbnail: '/thumbnails/stonks-thumb.svg',
                      features: [
                        'LSTM, Transformer & GNN Neural Networks',
                        'News Intelligence & Sentiment Analysis',
                        'Portfolio Optimization & Risk Analytics',
                        'Production-Grade Infrastructure'
                      ]
                    })}
                    className="p-2 hover:bg-samurai-red/20 rounded-lg transition-colors"
                  >
                    <Info className="text-samurai-red" size={20} />
                  </button>
                </div>
                
                {/* Thumbnail */}
                <div className="mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark">
                  <img 
                    src="/thumbnails/stonks-thumb.svg" 
                    alt="STONKS UI Preview" 
                    className="w-full h-32 object-cover"
                  />
                </div>
                
                <p className="text-white/80 mb-4 text-sm leading-relaxed">
                  Advanced ML platform wielding real-time analysis, predictive strategies, and news intelligence.
                </p>
                
                <Link
                  to="/stonks"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Forge Section */}
      <section className="py-24 bg-samurai-grey-darker relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <Hammer className="w-12 h-12 text-samurai-red mx-auto" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              THE FORGE
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Crafted with battle-tested, production-grade technologies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group bg-samurai-black rounded-2xl p-8 border-2 border-samurai-steel-dark hover:border-samurai-red transition-all duration-300 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 steel-texture rounded-xl flex items-center justify-center mr-3">
                  <Sparkles className="text-samurai-red" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white">Backend</h3>
              </div>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  Python 3.13 & FastAPI
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  TensorFlow & PyTorch
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  SQLAlchemy & Redis
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  Docker & Kubernetes
                </li>
              </ul>
            </div>

            <div className="group bg-samurai-black rounded-2xl p-8 border-2 border-samurai-steel-dark hover:border-samurai-red transition-all duration-300 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 steel-texture rounded-xl flex items-center justify-center mr-3">
                  <Zap className="text-samurai-red" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white">Frontend</h3>
              </div>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  React & TypeScript
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  Redux Toolkit
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  TailwindCSS
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  Vite Build Tool
                </li>
              </ul>
            </div>

            <div className="group bg-samurai-black rounded-2xl p-8 border-2 border-samurai-steel-dark hover:border-samurai-red transition-all duration-300 card-hover">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 steel-texture rounded-xl flex items-center justify-center mr-3">
                  <Flame className="text-samurai-red animate-flame-flicker" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white">AI & ML</h3>
              </div>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  OpenAI GPT-4
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  Anthropic Claude
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  HuggingFace Models
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-samurai-red rounded-full mr-3"></span>
                  Custom ML Pipelines
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* README Popup */}
      {readmePopup && (
        <ReadmePopup
          title={readmePopup.title}
          readmeUrl={readmePopup.url}
          onClose={() => setReadmePopup(null)}
        />
      )}

      {/* Info Popup */}
      {infoPopup && (
        <InfoPopup
          title={infoPopup.title}
          features={infoPopup.features}
          icon={infoPopup.icon}
          thumbnail={infoPopup.thumbnail}
          onClose={() => setInfoPopup(null)}
        />
      )}
    </div>
  )
}
