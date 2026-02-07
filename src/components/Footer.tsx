import { Github, Twitter, Linkedin, Flame } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-samurai-black border-t-2 border-samurai-red text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 steel-texture rounded-xl flex items-center justify-center">
                <Flame className="text-samurai-red animate-flame-flicker" size={28} />
              </div>
              <span className="text-2xl font-black text-white">RONIN MEDIA GROUP</span>
            </div>
            <p className="text-samurai-steel-light mb-6 leading-relaxed">
              Forging cutting-edge AI-powered weapons for financial conquest, intelligence gathering, and automated warfare in the digital realm.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/54MUR-AI" target="_blank" rel="noopener noreferrer" className="w-10 h-10 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all">
                <Github size={20} />
              </a>
              <a href="#" className="w-10 h-10 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 steel-texture rounded-lg flex items-center justify-center text-samurai-red hover:bg-samurai-red hover:text-white transition-all">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black mb-4 text-samurai-red">ARSENAL</h3>
            <ul className="space-y-2">
              <li><a href="/stonks" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">STONKS Platform</a></li>
              <li><a href="/scraper" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">Web Scraper</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-black mb-4 text-samurai-red">RESOURCES</h3>
            <ul className="space-y-2">
              <li><a href="https://github.com/54MUR-AI" target="_blank" rel="noopener noreferrer" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">GitHub</a></li>
              <li><a href="https://github.com/54MUR-AI/stonks" target="_blank" rel="noopener noreferrer" className="text-samurai-steel-light hover:text-samurai-red transition-colors font-semibold">Documentation</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-samurai-steel-dark mt-8 pt-8 text-center text-samurai-steel-light">
          <p className="font-semibold">&copy; {new Date().getFullYear()} RONIN MEDIA GROUP. All rights reserved.</p>
          <p className="text-sm mt-2 text-samurai-steel">Forged in the fires of innovation</p>
        </div>
      </div>
    </footer>
  )
}
