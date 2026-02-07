import { Github, TrendingUp, Brain, Shield, Zap } from 'lucide-react'

export default function StonksPage() {
  return (
    <div className="min-h-screen bg-samurai-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-samurai-red to-samurai-red-dark rounded-2xl flex items-center justify-center shadow-lg shadow-samurai-red/50 animate-glow-pulse">
              <TrendingUp className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-6xl font-black text-samurai-red mb-4 uppercase neon-text tracking-wider">STONKS</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto font-semibold">
            Advanced Financial Machine Learning Platform with News Intelligence
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="https://stonks-app.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-samurai-red to-samurai-red-dark text-white rounded-xl font-bold hover:from-samurai-red-dark hover:to-samurai-red-darker transition shadow-lg shadow-samurai-red/30 hover:shadow-xl hover:shadow-samurai-red/50"
            >
              Launch App
            </a>
            <a
              href="https://github.com/54MUR-AI/stonks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border-2 border-samurai-red text-samurai-red rounded-xl font-bold hover:bg-samurai-red hover:text-white transition"
            >
              <Github className="mr-2" size={20} />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20">
            <Brain className="text-samurai-red mb-4 animate-flame-flicker" size={32} />
            <h3 className="text-2xl font-bold text-white mb-4 uppercase">Advanced ML Models</h3>
            <ul className="space-y-2 text-white/80">
              <li>• LSTM, Transformer & WaveNet architectures</li>
              <li>• Graph Neural Networks (GNN)</li>
              <li>• Custom attention mechanisms</li>
              <li>• Transfer learning capabilities</li>
              <li>• GPU optimization with mixed precision</li>
            </ul>
          </div>

          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20">
            <Zap className="text-samurai-red mb-4 animate-flame-flicker" size={32} />
            <h3 className="text-2xl font-bold text-white mb-4 uppercase">News Intelligence 🆕</h3>
            <ul className="space-y-2 text-white/80">
              <li>• Multi-source news scraping</li>
              <li>• AI-powered summarization</li>
              <li>• Financial sentiment analysis</li>
              <li>• Symbol extraction & tagging</li>
              <li>• Automated monitoring</li>
            </ul>
          </div>

          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20">
            <TrendingUp className="text-samurai-red mb-4 animate-flame-flicker" size={32} />
            <h3 className="text-2xl font-bold text-white mb-4 uppercase">Portfolio Management</h3>
            <ul className="space-y-2 text-white/80">
              <li>• Advanced portfolio optimization</li>
              <li>• Risk parity & Black-Litterman</li>
              <li>• Automated rebalancing</li>
              <li>• Real-time monitoring</li>
              <li>• Performance analytics</li>
            </ul>
          </div>

          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20">
            <Shield className="text-samurai-red mb-4 animate-flame-flicker" size={32} />
            <h3 className="text-2xl font-bold text-white mb-4 uppercase">Production Infrastructure</h3>
            <ul className="space-y-2 text-white/80">
              <li>• Docker & Kubernetes deployment</li>
              <li>• CI/CD with GitHub Actions</li>
              <li>• Prometheus & Grafana monitoring</li>
              <li>• Auto-scaling capabilities</li>
              <li>• Security scanning & testing</li>
            </ul>
          </div>
        </div>

        <div className="bg-samurai-black-lighter border-2 border-samurai-red rounded-2xl p-8 mb-12 shadow-lg shadow-samurai-red/20">
          <h2 className="text-3xl font-bold text-white mb-6 uppercase neon-text">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold text-samurai-red mb-2 uppercase">Real-time Analysis</h4>
              <p className="text-white/80">Process market data and news in real-time with WebSocket streaming</p>
            </div>
            <div>
              <h4 className="font-bold text-samurai-red mb-2 uppercase">Sentiment Intelligence</h4>
              <p className="text-white/80">Financial-specific sentiment analysis with custom lexicon</p>
            </div>
            <div>
              <h4 className="font-bold text-samurai-red mb-2 uppercase">Automated Trading</h4>
              <p className="text-white/80">Risk-aware order management and execution engine</p>
            </div>
          </div>
        </div>

        <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-2xl p-8 shadow-lg shadow-samurai-red/20">
          <h2 className="text-3xl font-bold text-white mb-4 uppercase">Live Application</h2>
          <p className="text-white/80 mb-6">
            Interact with the STONKS platform directly below. Note: First load may take ~30 seconds as the free tier spins up.
          </p>
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <iframe
              src="https://stonks-app.onrender.com"
              className="absolute top-0 left-0 w-full h-full border-2 border-samurai-red/50 rounded-lg"
              title="STONKS Application"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
