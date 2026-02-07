import { Github, FileText, Video, FileType, Sparkles } from 'lucide-react'

export default function ScraperPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-600 rounded-2xl flex items-center justify-center">
              <FileText className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Web Scraper & Summarizer</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI-Powered tool for scraping and summarizing web content with intelligent analysis
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="https://scraper-app.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Launch App
            </a>
            <a
              href="https://github.com/54MUR-AI/scraper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition"
            >
              <Github className="mr-2" size={20} />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <FileText className="text-green-600 mb-4 mx-auto" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Articles</h3>
            <p className="text-gray-600">
              Scrape Medium, Substack, blogs, and news sites with intelligent content extraction
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <Video className="text-green-600 mb-4 mx-auto" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Videos</h3>
            <p className="text-gray-600">
              Extract YouTube transcripts and analyze video content automatically
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-md text-center">
            <FileType className="text-green-600 mb-4 mx-auto" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">PDFs</h3>
            <p className="text-gray-600">
              Parse PDF documents, research papers, and reports with ease
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 mb-12">
          <div className="flex items-center mb-6">
            <Sparkles className="text-green-600 mr-3" size={32} />
            <h2 className="text-3xl font-bold text-gray-900">AI-Powered Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Multiple AI Providers</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• OpenAI GPT-4</li>
                <li>• Anthropic Claude</li>
                <li>• Ollama (Local models)</li>
                <li>• HuggingFace models</li>
                <li>• Simple extractive summarization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Smart Processing</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Automatic summarization</li>
                <li>• Key points extraction</li>
                <li>• Batch processing</li>
                <li>• JSON output format</li>
                <li>• Rich CLI interface</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-md mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Usage Example</h2>
          <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`# Scrape and summarize a single URL
python main.py scrape "https://example.com/article"

# Batch process multiple URLs
python main.py batch urls.txt -o output/

# Scrape without summarization
python main.py scrape "https://example.com" --no-summary`}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Live Application</h2>
          <p className="text-gray-600 mb-6">
            Try the Scraper web interface directly below. Note: First load may take ~30 seconds as the free tier spins up.
          </p>
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <iframe
              src="https://scraper-app.onrender.com"
              className="absolute top-0 left-0 w-full h-full border-2 border-gray-200 rounded-lg"
              title="Scraper Application"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
