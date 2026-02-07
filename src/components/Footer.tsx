import { Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 gradient-bg rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <span className="text-2xl font-bold">Ronin Media Group</span>
            </div>
            <p className="text-gray-400 mb-4">
              Building cutting-edge AI-powered tools for financial analysis, web scraping, and intelligent automation.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/54MUR-AI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <Github size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter size={24} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin size={24} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Products</h3>
            <ul className="space-y-2">
              <li><a href="/stonks" className="text-gray-400 hover:text-white transition">STONKS Platform</a></li>
              <li><a href="/scraper" className="text-gray-400 hover:text-white transition">Web Scraper</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="https://github.com/54MUR-AI" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">GitHub</a></li>
              <li><a href="https://github.com/54MUR-AI/stonks" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">Documentation</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Ronin Media Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
