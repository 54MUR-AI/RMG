import { Github, TrendingUp, Brain, Shield, Zap } from 'lucide-react'

export default function StonksPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">STONKS</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Advanced Financial Machine Learning Platform with News Intelligence
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="https://github.com/54MUR-AI/stonks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              <Github className="mr-2" size={20} />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-md">
            <Brain className="text-purple-600 mb-4" size={32} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Advanced ML Models</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• LSTM, Transformer & WaveNet architectures</li>
              <li>• Graph Neural Networks (GNN)</li>
              <li>• Custom attention mechanisms</li>
              <li>• Transfer learning capabilities</li>
              <li>• GPU optimization with mixed precision</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md">
            <Zap className="text-purple-600 mb-4" size={32} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">News Intelligence 🆕</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Multi-source news scraping</li>
              <li>• AI-powered summarization</li>
              <li>• Financial sentiment analysis</li>
              <li>• Symbol extraction & tagging</li>
              <li>• Automated monitoring</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md">
            <TrendingUp className="text-purple-600 mb-4" size={32} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Portfolio Management</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Advanced portfolio optimization</li>
              <li>• Risk parity & Black-Litterman</li>
              <li>• Automated rebalancing</li>
              <li>• Real-time monitoring</li>
              <li>• Performance analytics</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md">
            <Shield className="text-purple-600 mb-4" size={32} />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Production Infrastructure</h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Docker & Kubernetes deployment</li>
              <li>• CI/CD with GitHub Actions</li>
              <li>• Prometheus & Grafana monitoring</li>
              <li>• Auto-scaling capabilities</li>
              <li>• Security scanning & testing</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Real-time Analysis</h4>
              <p className="text-gray-600">Process market data and news in real-time with WebSocket streaming</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Sentiment Intelligence</h4>
              <p className="text-gray-600">Financial-specific sentiment analysis with custom lexicon</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Automated Trading</h4>
              <p className="text-gray-600">Risk-aware order management and execution engine</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
