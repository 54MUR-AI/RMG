import { Link } from 'react-router-dom'
import { TrendingUp, FileText, Sparkles, ArrowRight, Github, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Ronin Media Group
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Building AI-Powered Tools for the Future
            </p>
            <p className="text-lg mb-12 max-w-3xl mx-auto text-purple-50">
              We create cutting-edge software solutions that leverage artificial intelligence, 
              machine learning, and advanced automation to solve real-world problems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/54MUR-AI"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                <Github className="mr-2" size={20} />
                View on GitHub
              </a>
              <a
                href="#products"
                className="inline-flex items-center justify-center px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition"
              >
                Explore Products
                <ArrowRight className="ml-2" size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Products</h2>
            <p className="text-xl text-gray-600">
              Innovative tools powered by cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* STONKS Card */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">STONKS</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Advanced Financial Machine Learning Platform with real-time market analysis, 
                predictive trading strategies, and comprehensive news intelligence.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Sparkles size={16} className="mr-2 text-purple-600" />
                  <span>LSTM, Transformer & GNN Models</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Sparkles size={16} className="mr-2 text-purple-600" />
                  <span>News Intelligence & Sentiment Analysis</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Sparkles size={16} className="mr-2 text-purple-600" />
                  <span>Portfolio Optimization & Risk Analytics</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Sparkles size={16} className="mr-2 text-purple-600" />
                  <span>Production-Grade Infrastructure</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/stonks"
                  className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700 transition"
                >
                  Learn More
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <a
                  href="https://stonks-app.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  Launch App
                </a>
              </div>
            </div>

            {/* Scraper Card */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Web Scraper</h3>
              </div>
              <p className="text-gray-700 mb-6">
                Powerful AI-powered web scraping tool that extracts, summarizes, and analyzes 
                content from articles, videos, PDFs, and more.
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-gray-600">
                  <Zap size={16} className="mr-2 text-green-600" />
                  <span>Multi-Source Scraping (Articles, Videos, PDFs)</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Zap size={16} className="mr-2 text-green-600" />
                  <span>AI Summarization (GPT-4, Claude, Ollama)</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Zap size={16} className="mr-2 text-green-600" />
                  <span>Key Points Extraction</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Zap size={16} className="mr-2 text-green-600" />
                  <span>Batch Processing</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Link
                  to="/scraper"
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition"
                >
                  Learn More
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <a
                  href="https://scraper-app.onrender.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Launch App
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Technology Stack</h2>
            <p className="text-xl text-gray-600">
              Built with modern, production-grade technologies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Python 3.13 & FastAPI</li>
                <li>• TensorFlow & PyTorch</li>
                <li>• SQLAlchemy & Redis</li>
                <li>• Docker & Kubernetes</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• React & TypeScript</li>
                <li>• Redux Toolkit</li>
                <li>• TailwindCSS</li>
                <li>• Vite Build Tool</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI & ML</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• OpenAI GPT-4</li>
                <li>• Anthropic Claude</li>
                <li>• HuggingFace Models</li>
                <li>• Custom ML Pipelines</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Explore our open-source projects and start building with our tools today.
          </p>
          <a
            href="https://github.com/54MUR-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            <Github className="mr-2" size={20} />
            Visit GitHub
          </a>
        </div>
      </section>
    </div>
  )
}
