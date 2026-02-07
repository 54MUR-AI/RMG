import { TrendingUp, FileText, Sparkles, Zap, Flame, Hammer, Lock, Brain } from 'lucide-react'
import { Link } from 'react-router-dom'
import FloatingEmbers from '../components/FloatingEmbers'
import CrossedKatanasIcon from '../components/CrossedKatanasIcon'
import DiscordIcon from '../components/DiscordIcon'
import ReadmePopup from '../components/ReadmePopup'
import { useState } from 'react'

export default function Home() {
  const [readmePopup, setReadmePopup] = useState<{ title: string; url: string } | null>(null)
  const [featuredCard, setFeaturedCard] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-samurai-black relative">
      {/* Floating embers - fixed to viewport */}
      <FloatingEmbers />
      
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* OMNI Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ${
                featuredCard === 'OMNI' 
                  ? 'md:col-span-2 lg:col-span-2 md:row-span-2 lg:col-start-2 lg:row-start-1' 
                  : featuredCard 
                    ? 'lg:col-start-1 lg:row-start-1' 
                    : ''
              }`}
              onClick={() => {
                if (featuredCard === 'OMNI') {
                  setFeaturedCard(null)
                } else {
                  document.getElementById('arsenal')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setTimeout(() => setFeaturedCard('OMNI'), 300)
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                    <Brain className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                      OMNI
                    </h3>
                    <p className="text-xs text-samurai-red font-bold tracking-wider">Optimized Multi-Model Networked Intelligence</p>
                  </div>
                </div>
                
                {/* Thumbnail */}
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark transition-all duration-500 ${
                  featuredCard === 'OMNI' ? 'h-64' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/omni-thumb.svg" 
                    alt="OMNI UI Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Expanded Description */}
                {featuredCard === 'OMNI' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      OMNI is a comprehensive AI dashboard that provides seamless multi-model interaction, advanced plugin management, and real-time performance monitoring. Built with PyQt6, it offers a powerful desktop environment for managing multiple AI models simultaneously, featuring dynamic model switching, streaming responses, and a robust plugin ecosystem.
                    </p>
                    <h4 className="text-sm font-bold text-samurai-red mb-2">Key Features:</h4>
                    <ul className="space-y-1 mb-4">
                      {['Multiple AI Models (Ollama, Claude, GPT, Grok)', 'PyQt6 Desktop Application', 'Plugin System with Marketplace', 'Text-to-Speech & Audio Capabilities', 'Vector Database Integration', 'Code Editor with Syntax Highlighting'].map((feature, idx) => (
                        <li key={idx} className="flex items-start text-xs text-white/80">
                          <span className="w-1.5 h-1.5 bg-samurai-red rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Compact Description */}
                {featuredCard !== 'OMNI' && (
                  <p className="text-white/80 mb-4 text-sm leading-relaxed flex-1">
                    Comprehensive AI dashboard providing multi-model interaction, plugin management, and performance monitoring.
                  </p>
                )}
                
                <Link
                  to="/omni"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>

            {/* SCRP Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ${
                featuredCard === 'SCRP' 
                  ? 'md:col-span-2 lg:col-span-2 md:row-span-2 lg:col-start-2 lg:row-start-1' 
                  : featuredCard 
                    ? 'lg:col-start-1 lg:row-start-2' 
                    : ''
              }`}
              onClick={() => {
                if (featuredCard === 'SCRP') {
                  setFeaturedCard(null)
                } else {
                  document.getElementById('arsenal')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setTimeout(() => setFeaturedCard('SCRP'), 300)
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                    <FileText className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                      SCRP
                    </h3>
                    <p className="text-xs text-samurai-red font-bold tracking-wider">Smart Content Retrieval & Processing</p>
                  </div>
                </div>
                
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark transition-all duration-500 ${
                  featuredCard === 'SCRP' ? 'h-64' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/scrp-thumb.svg" 
                    alt="SCRP UI Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {featuredCard === 'SCRP' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      SCRP is an AI-powered content extraction and summarization platform that transforms articles, videos, and PDFs into actionable intelligence. Leveraging advanced natural language processing with GPT-4, Claude, and Ollama, it automatically extracts key insights, generates comprehensive summaries, and processes multiple sources simultaneously.
                    </p>
                    <h4 className="text-sm font-bold text-samurai-red mb-2">Key Features:</h4>
                    <ul className="space-y-1 mb-4">
                      {['Multi-Source Scraping (Articles, Videos, PDFs)', 'AI Summarization (GPT-4, Claude, Ollama)', 'Key Points Extraction & Analysis', 'High-Speed Batch Processing'].map((feature, idx) => (
                        <li key={idx} className="flex items-start text-xs text-white/80">
                          <span className="w-1.5 h-1.5 bg-samurai-red rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {featuredCard !== 'SCRP' && (
                  <p className="text-white/80 mb-4 text-sm leading-relaxed flex-1">
                    AI-powered content extraction and summarization that transforms articles, videos, and PDFs into actionable intelligence.
                  </p>
                )}
                
                <Link
                  to="/scraper"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>

            {/* LDGR Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ${
                featuredCard === 'LDGR' 
                  ? 'md:col-span-2 lg:col-span-2 md:row-span-2 lg:col-start-2 lg:row-start-1' 
                  : featuredCard 
                    ? 'lg:col-start-4 lg:row-start-1' 
                    : ''
              }`}
              onClick={() => {
                if (featuredCard === 'LDGR') {
                  setFeaturedCard(null)
                } else {
                  document.getElementById('arsenal')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setTimeout(() => setFeaturedCard('LDGR'), 300)
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                    <Lock className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                      LDGR
                    </h3>
                    <p className="text-xs text-samurai-red font-bold tracking-wider">Layered Data Gateway & Repository</p>
                  </div>
                </div>
                
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark transition-all duration-500 ${
                  featuredCard === 'LDGR' ? 'h-64' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/ldgr-thumb.svg" 
                    alt="LDGR UI Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {featuredCard === 'LDGR' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      LDGR is a blockchain-powered database management system that combines military-grade encryption with immutable data storage. Built on Ethereum with Hardhat, it provides AES-256 and RSA encryption, smart contract-based transactions, and decentralized verification.
                    </p>
                    <h4 className="text-sm font-bold text-samurai-red mb-2">Key Features:</h4>
                    <ul className="space-y-1 mb-4">
                      {['Blockchain Integration (Ethereum/Hardhat)', 'AES/RSA High-Level Encryption', 'Smart Contract Data Transactions', 'User-Friendly Database Management'].map((feature, idx) => (
                        <li key={idx} className="flex items-start text-xs text-white/80">
                          <span className="w-1.5 h-1.5 bg-samurai-red rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {featuredCard !== 'LDGR' && (
                  <p className="text-white/80 mb-4 text-sm leading-relaxed flex-1">
                    Blockchain-powered database management with military-grade encryption and immutable data storage.
                  </p>
                )}
                
                <Link
                  to="/ldgr"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>

            {/* WSPR Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ${
                featuredCard === 'WSPR' 
                  ? 'md:col-span-2 lg:col-span-2 md:row-span-2 lg:col-start-2 lg:row-start-1' 
                  : featuredCard 
                    ? 'lg:col-start-4 lg:row-start-2' 
                    : ''
              }`}
              onClick={() => {
                if (featuredCard === 'WSPR') {
                  setFeaturedCard(null)
                } else {
                  document.getElementById('arsenal')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setTimeout(() => setFeaturedCard('WSPR'), 300)
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                    <Zap className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                      WSPR
                    </h3>
                    <p className="text-xs text-samurai-red font-bold tracking-wider">Web-Secure P2P Relay</p>
                  </div>
                </div>
                
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark transition-all duration-500 ${
                  featuredCard === 'WSPR' ? 'h-64' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/wspr-thumb.svg" 
                    alt="WSPR UI Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {featuredCard === 'WSPR' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      WSPR is a privacy-focused encrypted communication platform featuring end-to-end encryption and perfect forward secrecy. Built with React, TypeScript, and PostgreSQL, it provides real-time secure messaging with client-side AES-GCM encryption and comprehensive two-factor authentication.
                    </p>
                    <h4 className="text-sm font-bold text-samurai-red mb-2">Key Features:</h4>
                    <ul className="space-y-1 mb-4">
                      {['End-to-End AES-GCM Encryption', 'Real-Time Encrypted Messaging', 'Two-Factor Authentication (2FA)', 'React + TypeScript + PostgreSQL'].map((feature, idx) => (
                        <li key={idx} className="flex items-start text-xs text-white/80">
                          <span className="w-1.5 h-1.5 bg-samurai-red rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {featuredCard !== 'WSPR' && (
                  <p className="text-white/80 mb-4 text-sm leading-relaxed flex-1">
                    Privacy-focused encrypted communication platform with end-to-end encryption and perfect forward secrecy.
                  </p>
                )}
                
                <Link
                  to="/wspr"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </Link>
              </div>
            </div>

            {/* STONKS Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ${
                featuredCard === 'STONKS' 
                  ? 'md:col-span-2 lg:col-span-2 md:row-span-2 lg:col-start-2 lg:row-start-1' 
                  : featuredCard && featuredCard !== 'STONKS'
                    ? 'hidden lg:block lg:col-start-2 lg:row-start-3' 
                    : ''
              }`}
              onClick={() => {
                if (featuredCard === 'STONKS') {
                  setFeaturedCard(null)
                } else {
                  document.getElementById('arsenal')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  setTimeout(() => setFeaturedCard('STONKS'), 300)
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 flex-shrink-0 steel-texture rounded-xl flex items-center justify-center group-hover:animate-glow-pulse">
                    <TrendingUp className="text-white group-hover:text-samurai-red transition-colors" size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-white group-hover:text-samurai-red transition-colors">
                      STONKS
                    </h3>
                    <p className="text-xs text-samurai-red font-bold tracking-wider">Smart Trading Options <span className="lowercase">for</span> Novices & Knowledgeable Speculators</p>
                  </div>
                </div>
                
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark transition-all duration-500 ${
                  featuredCard === 'STONKS' ? 'h-64' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/stonks-thumb.svg" 
                    alt="STONKS UI Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {featuredCard === 'STONKS' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      STONKS is an advanced machine learning platform for financial market analysis and trading strategy development. Powered by cutting-edge neural networks including LSTM, Transformers, and Graph Neural Networks, it processes real-time market data, news sentiment, and technical indicators to generate predictive insights.
                    </p>
                    <h4 className="text-sm font-bold text-samurai-red mb-2">Key Features:</h4>
                    <ul className="space-y-1 mb-4">
                      {['LSTM, Transformer & GNN Neural Networks', 'News Intelligence & Sentiment Analysis', 'Portfolio Optimization & Risk Analytics', 'Production-Grade Infrastructure'].map((feature, idx) => (
                        <li key={idx} className="flex items-start text-xs text-white/80">
                          <span className="w-1.5 h-1.5 bg-samurai-red rounded-full mr-2 mt-1.5 flex-shrink-0"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {featuredCard !== 'STONKS' && (
                  <p className="text-white/80 mb-4 text-sm leading-relaxed flex-1">
                    Advanced ML platform wielding real-time analysis, predictive strategies, and news intelligence.
                  </p>
                )}
                
                <Link
                  to="/stonks"
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                  onClick={(e) => e.stopPropagation()}
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
    </div>
  )
}
