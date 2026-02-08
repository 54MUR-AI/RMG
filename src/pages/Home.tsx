import { TrendingUp, FileText, Sparkles, Zap, Flame, Hammer, Lock, Brain, Code2, Database, Container, Server, Cpu, Palette, Layout, Wrench, Bot, MessageSquare, Network } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import CrossedKatanasIcon from '../components/CrossedKatanasIcon'
import DiscordIcon from '../components/DiscordIcon'
import ReadmePopup from '../components/ReadmePopup'
import AuthPopup from '../components/AuthPopup'
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

  // Helper to get CSS Grid order based on which card is featured
  // Target layout: Col1[Card1, Card3], Col2[FEATURED (tall)], Col3[Card2, Card4]
  // Grid positions: 1=left-top, 2=center-top, 3=right-top, 4=left-bottom, 5=center-bottom, 6=right-bottom
  const getCardOrder = (cardName: string) => {
    if (!featuredCard) return 0 // Natural order when nothing featured
    if (cardName === featuredCard) return 2 // Featured card in position 2 (center column, spans 2 rows)
    
    // Other 4 cards arranged around featured: positions 1, 3, 4, 6 (skipping 2 and 5 for featured)
    // When OMNI featured: SCRP=1, LDGR=3, WSPR=4, STONKS=6
    const allCards = ['OMNI', 'SCRP', 'LDGR', 'WSPR', 'STONKS']
    const otherCards = allCards.filter(c => c !== featuredCard)
    const positions = [1, 3, 4, 6] // Left-top, right-top, left-bottom, right-bottom
    const orderMap: Record<string, number> = {}
    otherCards.forEach((card, idx) => {
      orderMap[card] = positions[idx]
    })
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
              No masters, no compromises, just powerful tools.
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
              <CrossedKatanasIcon size={80} className="text-samurai-red mx-auto animate-flame-flicker" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 sm:mb-6 neon-text">
              ARSENAL
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/80 max-w-2xl mx-auto px-4">
              Powerful tools for the independent developer
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-[1fr_2fr_1fr] lg:grid-rows-2 gap-6 mb-12 lg:auto-rows-fr">
            {/* OMNI Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ease-in-out ${
                featuredCard === 'OMNI' ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
              }`}
              style={{ order: window.innerWidth >= 1024 ? getCardOrder('OMNI') : 0, transition: 'order 0s' }}
              onClick={() => setFeaturedCard('OMNI')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-20 h-full flex flex-col">
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
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark bg-samurai-grey-dark ${
                  featuredCard === 'OMNI' ? 'h-48' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/omni-thumb.svg" 
                    alt="OMNI UI Preview" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                
                {/* Expanded Description */}
                {featuredCard === 'OMNI' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      OMNI represents the pinnacle of AI model orchestration, providing a unified command center for managing and interacting with multiple large language models simultaneously. Built from the ground up with PyQt6, this sophisticated desktop application delivers enterprise-grade performance monitoring, real-time streaming responses, and seamless model switching across providers including Ollama, Anthropic Claude, OpenAI GPT-4, and xAI Grok.
                    </p>
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      The platform features an extensible plugin architecture with a built-in marketplace, allowing users to enhance functionality through community-developed extensions. Advanced capabilities include text-to-speech synthesis with multiple voice options, vector database integration for semantic search and RAG implementations, and a fully-featured code editor with syntax highlighting supporting 50+ programming languages. The system maintains conversation history with export capabilities, supports custom system prompts and temperature controls, and provides detailed token usage analytics and cost tracking across all connected models.
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
                
                <button
                  onClick={(e) => handleLaunchClick(e, '/omni')}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </button>
              </div>
            </div>

            {/* SCRP Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ease-in-out ${
                featuredCard === 'SCRP' ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
              }`}
              style={{ order: window.innerWidth >= 1024 ? getCardOrder('SCRP') : 0, transition: 'order 0s' }}
              onClick={() => setFeaturedCard('SCRP')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-20 h-full flex flex-col">
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
                
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark bg-samurai-grey-dark ${
                  featuredCard === 'SCRP' ? 'h-48' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/scrp-thumb.svg" 
                    alt="SCRP UI Preview" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                
                {featuredCard === 'SCRP' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      SCRP revolutionizes content intelligence by transforming disparate information sources into structured, actionable insights. This advanced platform employs cutting-edge natural language processing to extract, analyze, and synthesize content from web articles, YouTube videos, academic PDFs, and documentation with unprecedented accuracy and speed.
                    </p>
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      Powered by multiple AI backends including GPT-4, Claude 3, and local Ollama models, SCRP performs multi-layered analysis including sentiment detection, entity recognition, topic modeling, and key phrase extraction. The system supports batch processing of hundreds of sources simultaneously, automatically categorizes content by relevance and quality, generates hierarchical summaries at multiple abstraction levels, and exports results in JSON, Markdown, or structured database formats. Advanced features include automatic citation generation, cross-reference detection between sources, duplicate content identification, and customizable extraction templates for domain-specific use cases.
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
                
                <button
                  onClick={(e) => handleLaunchClick(e, '/scraper')}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </button>
              </div>
            </div>

            {/* LDGR Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ease-in-out ${
                featuredCard === 'LDGR' ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
              }`}
              style={{ order: window.innerWidth >= 1024 ? getCardOrder('LDGR') : 0, transition: 'order 0s' }}
              onClick={() => setFeaturedCard('LDGR')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-20 h-full flex flex-col">
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
                
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark bg-samurai-grey-dark ${
                  featuredCard === 'LDGR' ? 'h-48' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/ldgr-thumb.svg" 
                    alt="LDGR UI Preview" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                
                {featuredCard === 'LDGR' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      LDGR establishes a new paradigm in secure data management by fusing blockchain immutability with military-grade cryptographic protocols. Built on the Ethereum network using the Hardhat development framework, this system provides tamper-proof data storage with cryptographic verification at every layer of the stack.
                    </p>
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      The architecture implements a multi-layered security model featuring AES-256-GCM encryption for data at rest, RSA-4096 for key exchange, and ECDSA for transaction signing. Smart contracts written in Solidity manage access control through role-based permissions, enforce data retention policies, and maintain comprehensive audit trails of all operations. The system supports atomic transactions with rollback capabilities, implements Merkle tree verification for data integrity, provides automatic backup and replication across nodes, and offers both public and private blockchain deployment options. Advanced features include time-locked data release, multi-signature authorization requirements, encrypted search capabilities, and compliance-ready logging for regulatory requirements including GDPR, HIPAA, and SOC 2.
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
                
                <button
                  onClick={(e) => handleLaunchClick(e, '/ldgr')}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </button>
              </div>
            </div>

            {/* WSPR Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ease-in-out ${
                featuredCard === 'WSPR' ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
              }`}
              style={{ order: window.innerWidth >= 1024 ? getCardOrder('WSPR') : 0, transition: 'order 0s' }}
              onClick={() => setFeaturedCard('WSPR')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-20 h-full flex flex-col">
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
                
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark bg-samurai-grey-dark ${
                  featuredCard === 'WSPR' ? 'h-48' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/wspr-thumb.svg" 
                    alt="WSPR UI Preview" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                
                {featuredCard === 'WSPR' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      WSPR delivers military-grade secure communications through a sophisticated web-based platform that prioritizes user privacy above all else. Implementing the Signal Protocol's Double Ratchet algorithm, every message benefits from perfect forward secrecy, ensuring that compromised keys cannot decrypt past communications.
                    </p>
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      Built with a modern React and TypeScript frontend paired with a hardened PostgreSQL backend, the platform performs all encryption operations client-side using AES-256-GCM with authenticated encryption. The system implements ECDH key exchange for establishing secure channels, supports ephemeral messaging with automatic deletion timers, provides verified device management with public key fingerprinting, and includes comprehensive two-factor authentication with TOTP and hardware key support. Real-time messaging operates over WebSocket connections with automatic reconnection and message queuing, while the platform maintains zero-knowledge architecture where the server never has access to plaintext content. Additional security features include screenshot detection, clipboard protection, secure file sharing with end-to-end encryption up to 100MB, and optional self-destructing messages with read receipts.
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
                
                <button
                  onClick={(e) => handleLaunchClick(e, '/wspr')}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </button>
              </div>
            </div>

            {/* STONKS Card */}
            <div 
              className={`group card-hover bg-samurai-grey-darker rounded-3xl p-6 border-2 border-samurai-steel-dark relative overflow-hidden cursor-pointer transition-all duration-500 ease-in-out ${
                featuredCard === 'STONKS' ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' : ''
              }`}
              style={{ order: window.innerWidth >= 1024 ? getCardOrder('STONKS') : 0, transition: 'order 0s' }}
              onClick={() => setFeaturedCard('STONKS')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-samurai-red/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-20 h-full flex flex-col">
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
                
                <div className={`mb-4 rounded-xl overflow-hidden border border-samurai-steel-dark bg-samurai-grey-dark ${
                  featuredCard === 'STONKS' ? 'h-48' : 'h-32'
                }`}>
                  <img 
                    src="/thumbnails/stonks-thumb.svg" 
                    alt="STONKS UI Preview" 
                    className="w-full h-full object-cover"
                    loading="eager"
                    decoding="async"
                  />
                </div>
                
                {featuredCard === 'STONKS' && (
                  <div className="mb-4 animate-fade-in">
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      STONKS represents the convergence of advanced machine learning and quantitative finance, providing institutional-grade analytical capabilities for traders at all experience levels. The platform employs a sophisticated ensemble of neural network architectures including LSTM networks for time-series prediction, Transformer models for pattern recognition, WaveNet for high-frequency analysis, and Graph Neural Networks for correlation discovery across asset classes.
                    </p>
                    <p className="text-white/90 mb-4 text-sm leading-relaxed">
                      The system ingests and processes real-time market data from multiple exchanges, performs sentiment analysis on financial news and social media using NLP models, calculates over 150 technical indicators, and generates probabilistic forecasts with confidence intervals. Portfolio optimization leverages modern portfolio theory combined with machine learning to balance risk-adjusted returns, while the backtesting engine supports walk-forward analysis, Monte Carlo simulation, and realistic slippage modeling. Advanced features include automated strategy generation using genetic algorithms, risk management with dynamic position sizing, real-time alert systems for market anomalies, integration with major brokerage APIs for live trading, and comprehensive performance analytics with Sharpe ratio, maximum drawdown, and alpha/beta calculations. The production infrastructure runs on Docker with Kubernetes orchestration, supports horizontal scaling, and includes comprehensive logging and monitoring.
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
                
                <button
                  onClick={(e) => handleLaunchClick(e, '/stonks')}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all flame-glow text-sm mt-auto"
                >
                  <Zap className="mr-2" size={18} />
                  Launch
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Forge Section */}
      <section className="py-24 bg-samurai-grey-darker relative overflow-hidden">
        <div className="absolute inset-0 pattern-bg opacity-5"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div id="forge" className="text-center mb-16">
            <div className="inline-block mb-4">
              <Hammer className="w-12 h-12 text-samurai-red mx-auto" />
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
              FORGE
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
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
