import { Github, FileText, Video, FileType, Sparkles } from 'lucide-react'

export default function ScraperPage() {
  return (
    <div className="min-h-screen bg-samurai-black py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-samurai-red to-samurai-red-dark rounded-2xl flex items-center justify-center shadow-lg shadow-samurai-red/50 animate-glow-pulse">
              <FileText className="text-white" size={40} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-samurai-red mb-4 uppercase neon-text tracking-wider">Web Scraper & Summarizer</h1>
          <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto font-semibold px-4">
            Beautiful web interface for scraping and summarizing any web content with AI
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 px-4">
            <a
              href="https://scraper-frontend-3hnj.onrender.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-samurai-red to-samurai-red-dark text-white rounded-xl font-bold hover:from-samurai-red-dark hover:to-samurai-red-darker transition shadow-lg shadow-samurai-red/30 hover:shadow-xl hover:shadow-samurai-red/50 touch-manipulation"
            >
              Launch Web App
            </a>
            <a
              href="https://github.com/54MUR-AI/scraper"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-samurai-red text-samurai-red rounded-xl font-bold hover:bg-samurai-red hover:text-white transition touch-manipulation"
            >
              <Github className="mr-2" size={20} />
              View on GitHub
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20 text-center">
            <FileText className="text-samurai-red mb-4 mx-auto animate-flame-flicker" size={48} />
            <h3 className="text-xl font-bold text-white mb-2 uppercase">Articles</h3>
            <p className="text-white/80">
              Scrape Medium, Substack, blogs, and news sites with intelligent content extraction
            </p>
          </div>

          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20 text-center">
            <Video className="text-samurai-red mb-4 mx-auto animate-flame-flicker" size={48} />
            <h3 className="text-xl font-bold text-white mb-2 uppercase">Videos</h3>
            <p className="text-white/80">
              Extract YouTube transcripts and analyze video content automatically
            </p>
          </div>

          <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20 text-center">
            <FileType className="text-samurai-red mb-4 mx-auto animate-flame-flicker" size={48} />
            <h3 className="text-xl font-bold text-white mb-2 uppercase">PDFs</h3>
            <p className="text-white/80">
              Parse PDF documents, research papers, and reports with ease
            </p>
          </div>
        </div>

        <div className="bg-samurai-black-lighter border-2 border-samurai-red rounded-2xl p-8 mb-12 shadow-lg shadow-samurai-red/20">
          <div className="flex items-center mb-6">
            <Sparkles className="text-samurai-red mr-3 animate-flame-flicker" size={32} />
            <h2 className="text-3xl font-bold text-white uppercase neon-text">AI-Powered Features</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-samurai-red mb-2 uppercase">Multiple AI Providers</h4>
              <ul className="space-y-1 text-white/80">
                <li>• OpenAI GPT-4</li>
                <li>• Anthropic Claude</li>
                <li>• Ollama (Local models)</li>
                <li>• HuggingFace models</li>
                <li>• Simple extractive summarization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-samurai-red mb-2 uppercase">Smart Processing</h4>
              <ul className="space-y-1 text-white/80">
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
          <h2 className="text-3xl font-bold text-white mb-6 uppercase">How to Use</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-samurai-red mb-3 uppercase">Web Interface</h4>
              <ul className="space-y-2 text-white/80">
                <li>1. Enter any URL in the search box</li>
                <li>2. Click "Scrape & Summarize"</li>
                <li>3. View AI-generated summary with key points</li>
                <li>4. Download results as JSON if needed</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-samurai-red mb-3 uppercase">CLI Usage</h4>
              <div className="bg-samurai-black rounded-lg p-4 border border-samurai-red/30">
                <pre className="text-samurai-red text-xs">
{`# Scrape and summarize
python main.py scrape "URL"

# Batch processing
python main.py batch urls.txt`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-samurai-black-light border-2 border-samurai-red/30 rounded-xl p-8 shadow-lg shadow-samurai-red/20">
          <h2 className="text-3xl font-bold text-white mb-4 uppercase">Live Web Application</h2>
          <p className="text-white/80 mb-6">
            Try the Scraper web interface directly below. Enter any URL to scrape and get an AI-powered summary. Note: First load may take ~30 seconds as the free tier spins up.
          </p>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src="https://scraper-frontend-3hnj.onrender.com"
              className="absolute top-0 left-0 w-full h-full border-2 border-samurai-red/50 rounded-lg"
              title="Scraper Web Application"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
