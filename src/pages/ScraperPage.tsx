import { Github, FileText, Video, FileType, Sparkles } from 'lucide-react'

export default function ScraperPage() {
  return (
    <div className="min-h-screen bg-samurai-black py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-samurai-red to-samurai-red-dark rounded-2xl flex items-center justify-center shadow-lg shadow-samurai-red/50 animate-glow-pulse">
              <FileText className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-6xl font-black text-samurai-red mb-4 uppercase neon-text tracking-wider">Web Scraper & Summarizer</h1>
          <p className="text-xl text-samurai-grey-light max-w-3xl mx-auto font-semibold">
            AI-Powered tool for scraping and summarizing web content with intelligent analysis
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <a
              href="https://scraper-app-w6xu.onrender.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-samurai-red to-samurai-red-dark text-white rounded-xl font-bold hover:from-samurai-red-dark hover:to-samurai-red-darker transition shadow-lg shadow-samurai-red/30 hover:shadow-xl hover:shadow-samurai-red/50"
            >
              Launch API Docs
            </a>
            <a
              href="https://github.com/54MUR-AI/scraper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border-2 border-samurai-red text-samurai-red rounded-xl font-bold hover:bg-samurai-red hover:text-white transition"
            >
              <Github className="mr-2" size={20} />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20 text-center">
            <FileText className="text-samurai-red mb-4 mx-auto animate-flame-flicker" size={48} />
            <h3 className="text-xl font-bold text-gray-100 mb-2 uppercase">Articles</h3>
            <p className="text-samurai-grey-light">
              Scrape Medium, Substack, blogs, and news sites with intelligent content extraction
            </p>
          </div>

          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20 text-center">
            <Video className="text-samurai-red mb-4 mx-auto animate-flame-flicker" size={48} />
            <h3 className="text-xl font-bold text-gray-100 mb-2 uppercase">Videos</h3>
            <p className="text-samurai-grey-light">
              Extract YouTube transcripts and analyze video content automatically
            </p>
          </div>

          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20 text-center">
            <FileType className="text-samurai-red mb-4 mx-auto animate-flame-flicker" size={48} />
            <h3 className="text-xl font-bold text-gray-100 mb-2 uppercase">PDFs</h3>
            <p className="text-samurai-grey-light">
              Parse PDF documents, research papers, and reports with ease
            </p>
          </div>
        </div>

        <div className="bg-samurai-black-lighter border-2 border-samurai-red rounded-2xl p-8 mb-12 shadow-lg shadow-samurai-red/20">
          <div className="flex items-center mb-6">
            <Sparkles className="text-samurai-red mr-3 animate-flame-flicker" size={32} />
            <h2 className="text-3xl font-bold text-gray-100 uppercase neon-text">AI-Powered Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-samurai-red mb-2 uppercase">Multiple AI Providers</h4>
              <ul className="space-y-1 text-samurai-grey-light">
                <li>• OpenAI GPT-4</li>
                <li>• Anthropic Claude</li>
                <li>• Ollama (Local models)</li>
                <li>• HuggingFace models</li>
                <li>• Simple extractive summarization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-samurai-red mb-2 uppercase">Smart Processing</h4>
              <ul className="space-y-1 text-samurai-grey-light">
                <li>• Automatic summarization</li>
                <li>• Key points extraction</li>
                <li>• Batch processing</li>
                <li>• JSON output format</li>
                <li>• Rich CLI interface</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20 mb-12">
          <h2 className="text-3xl font-bold text-gray-100 mb-6 uppercase">Usage Example</h2>
          <div className="bg-samurai-black rounded-lg p-6 overflow-x-auto border border-samurai-red/30">
            <pre className="text-samurai-red text-sm">
{`# Scrape and summarize a single URL
python main.py scrape "https://example.com/article"

# Batch process multiple URLs
python main.py batch urls.txt -o output/

# Scrape without summarization
python main.py scrape "https://example.com" --no-summary`}
            </pre>
          </div>
        </div>

        <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20">
          <h2 className="text-3xl font-bold text-gray-100 mb-4 uppercase">Interactive API Documentation</h2>
          <p className="text-samurai-grey-light mb-6">
            Try the Scraper API directly below using the interactive Swagger UI. Note: First load may take ~30 seconds as the free tier spins up.
          </p>
          <div className="relative w-full" style={{ paddingBottom: '75%' }}>
            <iframe
              src="https://scraper-app-w6xu.onrender.com/docs"
              className="absolute top-0 left-0 w-full h-full border-2 border-samurai-red/50 rounded-lg"
              title="Scraper API Documentation"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
