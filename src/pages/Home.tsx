import { TrendingUp, FileText, Sparkles, ArrowRight, Github, Zap, Flame, Hammer, Lock } from 'lucide-react'
import FloatingEmbers from '../components/FloatingEmbers'
import KatanaIcon from '../components/KatanaIcon'
import CrossedKatanasIcon from '../components/CrossedKatanasIcon'
import DiscordIcon from '../components/DiscordIcon'
import ReadmePopup from '../components/ReadmePopup'
import { useState } from 'react'

export default function Home() {
  const [readmePopup, setReadmePopup] = useState<{ title: string; url: string } | null>(null)

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* Floating embers - spans entire page */}
      <div className="fixed inset-0 pointer-events-none z-50">
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
            <div className="flex justify-center mb-8 relative" style={{ zIndex: 10 }}>
              <Flame className="w-20 h-20 text-white drop-shadow-[0_0_15px_rgba(230,57,70,1)] animate-flame-pulse-big" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-6 sm:mb-8 neon-text tracking-tight">
              RONIN MEDIA
            </h1>
            
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-4 sm:mb-6 font-bold text-white px-4">
              Forging AI-Powered Weapons for the Digital Age
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
            <div className="mb-6">
              <CrossedKatanasIcon size={80} className="text-samurai-red mx-auto animate-flame-flicker" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 neon-text">
              THE ARSENAL
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4">
              Battle-tested tools forged in the fires of innovation
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* STONKS Card - Katana */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-8 border-2 border-samurai-steel-dark relative overflow-hidden">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 flex-shrink-0 steel-texture rounded-2xl flex items-center justify-center mr-4 group-hover:animate-glow-pulse">
                    <TrendingUp className="text-white group-hover:text-samurai-red transition-colors" size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-black text-white group-hover:text-samurai-red transition-colors">
                      STONKS
                    </h3>
                    <p className="text-sm text-samurai-red font-bold tracking-wider">Smart Trading Options <span className="lowercase">for</span> Novices & Knowledgeable Speculators</p>
                  </div>
                </div>
                
                <p className="text-white/90 mb-8 text-base leading-relaxed">
                  Slice through market chaos with precision. Advanced ML platform wielding 
                  real-time analysis, predictive strategies, and news intelligence.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">LSTM, Transformer & GNN Neural Networks</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">News Intelligence & Sentiment Analysis</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">Portfolio Optimization & Risk Analytics</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">Production-Grade Infrastructure</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setReadmePopup({ title: 'STONKS', url: 'https://raw.githubusercontent.com/54MUR-AI/stonks/main/README.md' })}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-samurai-red text-samurai-red rounded-xl font-bold hover:bg-samurai-red hover:text-white transition-all group/btn"
                  >
                    <span>Details</span>
                    <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={20} />
                  </button>
                  <a
                    href="https://stonks-app.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-samurai-red text-white rounded-xl font-bold hover:bg-samurai-red-dark transition-all flame-glow"
                  >
                    <Zap className="mr-2" size={20} />
                    Launch
                  </a>
                </div>
              </div>
            </div>

            {/* Scraper Card - Wakizashi */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-8 border-2 border-samurai-steel-dark relative overflow-hidden">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 flex-shrink-0 steel-texture rounded-2xl flex items-center justify-center mr-4 group-hover:animate-glow-pulse">
                    <FileText className="text-white group-hover:text-samurai-red transition-colors" size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-black text-white group-hover:text-samurai-red transition-colors">
                      SCRP
                    </h3>
                    <p className="text-sm text-samurai-red font-bold uppercase tracking-wider">Smart Content Retrieval & Processing</p>
                  </div>
                </div>
                
                <p className="text-white/90 mb-8 text-base leading-relaxed">
                  AI-powered content extraction and summarization-powered scraping that conquers 
                  articles, videos, PDFs, and transforms them into actionable intelligence.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">Multi-Source Scraping (Articles, Videos, PDFs)</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">AI Summarization (GPT-4, Claude, Ollama)</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">Key Points Extraction & Analysis</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">High-Speed Batch Processing</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setReadmePopup({ title: 'SCRP', url: 'https://raw.githubusercontent.com/54MUR-AI/scraper/main/README.md' })}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-samurai-red text-samurai-red rounded-xl font-bold hover:bg-samurai-red hover:text-white transition-all group/btn"
                  >
                    <span>Details</span>
                    <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={20} />
                  </button>
                  <a
                    href="https://scraper-frontend-3hnj.onrender.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-samurai-red text-white rounded-xl font-bold hover:bg-samurai-red-dark transition-all flame-glow"
                  >
                    <Zap className="mr-2" size={20} />
                    Launch
                  </a>
                </div>
              </div>
            </div>

            {/* LDGR Card */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-8 border-2 border-samurai-steel-dark relative overflow-hidden">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 flex-shrink-0 steel-texture rounded-2xl flex items-center justify-center mr-4 group-hover:animate-glow-pulse">
                    <Lock className="text-white group-hover:text-samurai-red transition-colors" size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-black text-white group-hover:text-samurai-red transition-colors">
                      LDGR
                    </h3>
                    <p className="text-sm text-samurai-red font-bold uppercase tracking-wider">Layered Data Gateway & Repository</p>
                  </div>
                </div>
                
                <p className="text-white/90 mb-8 text-base leading-relaxed">
                  Blockchain-powered database management with military-grade encryption and immutable data storage.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">Blockchain Integration (Ethereum/Hardhat)</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">AES/RSA High-Level Encryption</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">Smart Contract Data Transactions</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">User-Friendly Database Management</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <a
                    href="https://github.com/54MUR-AI/ldgr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-samurai-red text-samurai-red rounded-xl font-bold hover:bg-samurai-red hover:text-white transition-all group/btn"
                  >
                    <Github className="mr-2" size={20} />
                    <span>View Source</span>
                  </a>
                  <div className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-samurai-grey-dark text-white/50 rounded-xl font-bold cursor-not-allowed">
                    <span>In Development</span>
                  </div>
                </div>
              </div>
            </div>

            {/* WSPR Card */}
            <div className="group card-hover bg-samurai-grey-darker rounded-3xl p-8 border-2 border-samurai-steel-dark relative overflow-hidden">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 flex-shrink-0 steel-texture rounded-2xl flex items-center justify-center mr-4 group-hover:animate-glow-pulse">
                    <Zap className="text-white group-hover:text-samurai-red transition-colors" size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-3xl font-black text-white group-hover:text-samurai-red transition-colors">
                      WSPR
                    </h3>
                    <p className="text-sm text-samurai-red font-bold uppercase tracking-wider">Web-Secure P2P Relay</p>
                  </div>
                </div>
                
                <p className="text-white/90 mb-8 text-base leading-relaxed">
                  Privacy-focused encrypted communication platform with end-to-end encryption and perfect forward secrecy.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">End-to-End AES-GCM Encryption</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">Real-Time Encrypted Messaging</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">Two-Factor Authentication (2FA)</span>
                  </div>
                  <div className="flex items-start relative" style={{ zIndex: 1 }}>
                    <Flame size={18} className="mr-3 text-samurai-red flex-shrink-0 mt-1 animate-flame-flicker" />
                    <span className="text-white/70">React + TypeScript + PostgreSQL</span>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <a
                    href="https://github.com/54MUR-AI/wspr-web-new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 border-2 border-samurai-red text-samurai-red rounded-xl font-bold hover:bg-samurai-red hover:text-white transition-all group/btn"
                  >
                    <Github className="mr-2" size={20} />
                    <span>View Source</span>
                  </a>
                  <div className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-samurai-grey-dark text-white/50 rounded-xl font-bold cursor-not-allowed">
                    <span>In Development</span>
                  </div>
                </div>
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

      {/* Epic CTA Section */}
      <section className="py-32 gradient-bg text-white relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-samurai-red rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Flame className="w-16 h-16 text-white mx-auto mb-8 animate-flame-flicker" />
          
          <h2 className="text-5xl md:text-6xl font-black mb-8 neon-text">
            JOIN THE BATTLE
          </h2>
          
          <div className="h-1 w-32 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
          
          <p className="text-2xl mb-12 text-gray-200 leading-relaxed">
            Explore our open-source arsenal and forge your own path with our tools.
            <br />
            <span className="text-samurai-steel-light">The code is yours to wield.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="https://github.com/54MUR-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center px-12 py-5 bg-white text-samurai-red rounded-xl font-black text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
            >
              <Github className="mr-3 group-hover:rotate-12 transition-transform" size={28} />
              ENTER THE DOJO
            </a>
            <a
              href="#arsenal"
              className="group inline-flex items-center justify-center px-12 py-5 border-2 border-white text-white rounded-xl font-black text-lg hover:bg-white hover:text-samurai-red transition-all transform hover:scale-105"
            >
              <KatanaIcon size={28} className="mr-3 group-hover:rotate-12 transition-transform" />
              VIEW ARSENAL
            </a>
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
    </div>
  )
}
