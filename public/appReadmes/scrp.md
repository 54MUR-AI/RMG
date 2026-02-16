# SCRP
## Smart Content Retrieval & Processing

AI-powered web scraping and content summarization tool with secure API key management through LDGR integration. Extract and summarize content from articles, YouTube videos, PDFs, and any web page using your choice of AI provider.

**Live Demo**: [https://scraper-frontend-3hnj.onrender.com](https://scraper-frontend-3hnj.onrender.com)  
**Part of**: [Ronin Media Group](https://ronin-media-group.netlify.app)

---

## Features

### Core Functionality
- 🌐 **Modern Web Interface**: Clean, responsive UI with real-time processing feedback
- 🤖 **Multiple AI Providers**: Ollama (local), OpenAI, Anthropic, HuggingFace support
- 📝 **Smart Summarization**: Structured 3-5 bullet point summaries (max 75 words)
- 🎯 **Multi-Source Support**: Articles, YouTube videos, PDFs, and generic web pages
- ⚡ **Fast Processing**: Optimized scraping and summarization pipeline
- 💾 **Export Results**: Download complete summaries as JSON
- 🔒 **Privacy-First**: Use Ollama for local AI processing (no data sent to cloud)

### Security & Integration
- 🔐 **LDGR Integration**: Secure API key storage with AES-256 encryption
- 🔑 **Centralized Key Management**: Store all API keys in LDGR, select in SCRP
- 🛡️ **Client-Side Decryption**: Keys are decrypted locally for maximum security
- 🔄 **Cross-Origin Auth**: Seamless authentication between RMG and SCRP
- 🎨 **Themed UI**: Consistent samurai-red design with custom scrollbars
- 📊 **Auto-Save to LDGR**: Scraped content automatically saved for later reference
- 🔗 **Source Tracking**: Displays all extracted links and references

## Supported Content Types

- **Articles**: Medium, Substack, blogs, news sites
- **Videos**: YouTube (via transcript extraction)
- **PDFs**: Direct PDF URL scraping
- **Generic**: Any web page with readable content

## Quick Start

### Using the Web UI (Recommended)

1. **Access SCRP** via [Ronin Media Group](https://ronin-media-group.netlify.app)
2. **Sign in** to RMG (required for LDGR integration)
3. **Navigate to SCRP** from the main menu
4. **Configure AI Settings** (first time only)
5. **Start scraping** immediately!

### Setting Up AI Provider (First Time)

#### Option 1: Ollama (Recommended - Free & Private)

1. **Install Ollama**:
   ```bash
   # Windows
   winget install Ollama.Ollama
   
   # macOS
   brew install ollama
   
   # Linux
   curl https://ollama.ai/install.sh | sh
   ```

2. **Pull Models**:
   ```bash
   ollama pull llama3
   ollama pull mistral
   ```

3. **Configure CORS** (Windows PowerShell as Admin):
   ```powershell
   [System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
   ```

4. **Install RMG Ollama Bridge Extension**:
   - Download from RMG repository
   - Load unpacked in Chrome (`chrome://extensions/`)
   - Enable Developer mode first

5. **In SCRP**:
   - Open AI Settings (gear icon)
   - Select "Ollama" as provider
   - Choose your model (e.g., llama3)
   - Click "Apply Settings"

#### Option 2: Cloud AI (OpenAI, Anthropic, HuggingFace)

SCRP uses **LDGR** for secure API key storage:

1. **Navigate to LDGR** in RMG
2. **Click "API Keys" tab**
3. **Add your API keys**:
   - Click "+ Add Key"
   - Select service (OpenAI, Anthropic, or HuggingFace)
   - Enter key name (e.g., "My OpenAI Key")
   - Paste your API key
   - Add optional description
   - Click "Add Key"
4. **Return to SCRP**
5. **Open AI Settings** (gear icon, bottom-right)
6. **Select provider and key** from dropdowns
7. **Choose model**
8. **Click "Apply Settings"**

Your API keys are encrypted with AES-256 and stored securely in LDGR. They're decrypted client-side only when needed.

---

## Usage Guide

### Basic Workflow

1. **Enter URL**: Paste any article, YouTube video, or PDF URL
2. **Click "Scrape & Summarize"**: Processing begins immediately
3. **View Results**: 
   - AI-generated summary
   - Key points extracted
   - Content metadata
4. **Export**: Download complete results as JSON

### Supported URLs

- **Articles**: `https://medium.com/@author/article`
- **YouTube**: `https://youtube.com/watch?v=VIDEO_ID`
- **PDFs**: `https://example.com/document.pdf`
- **Blogs**: Any blog or news site with readable content

---

## Local Development

### Prerequisites

- **Python 3.13+**
- **Node.js 18+**
- **npm or yarn**

### Installation

1. **Clone Repository**

```bash
git clone https://github.com/54MUR-AI/scraper.git
cd scraper
```

2. **Backend Setup**

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

3. **Frontend Setup**

```bash
cd web
npm install
```

4. **Environment Configuration**

Create `.env` in project root:

```bash
# Optional: Backend API keys (if not using LDGR)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
HUGGINGFACE_API_KEY=hf_...
```

Create `web/.env.local`:

```bash
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://meqfiyuaxgwbstcdmjgz.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally

**Terminal 1 - Backend**:

```bash
python api/main.py
# API runs on http://localhost:8000
```

**Terminal 2 - Frontend**:

```bash
cd web
npm run dev
# UI runs on http://localhost:5173
```

### API Endpoint Reference

**POST** `/scrape`

```bash
curl -X POST http://localhost:8000/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "summarize": true,
    "provider": "openai",
    "api_key": "sk-...",
    "model": "gpt-4-turbo-preview"
  }'
```

**Response**:

```json
{
  "success": true,
  "summary": {
    "original_url": "https://example.com/article",
    "title": "Article Title",
    "summary": "AI-generated summary...",
    "key_points": ["Point 1", "Point 2"],
    "content_type": "article",
    "word_count": 150,
    "model_used": "gpt-4-turbo-preview",
    "generated_at": "2024-01-01T12:00:00Z"
  },
  "original_content": {
    "url": "https://example.com/article",
    "title": "Article Title",
    "content": "Full scraped content...",
    "author": "Author Name",
    "metadata": {}
  }
}
```

---

## AI Providers

SCRP supports multiple AI providers. Cloud providers (OpenAI, Anthropic, HuggingFace) require API keys stored in **LDGR**. Ollama runs locally and requires no API keys.

### Ollama (Local AI) ⭐ Recommended
- **Models**: Llama 3, Mistral, Qwen3-VL, TinyLlama, and more
- **Best For**: Privacy, no API costs, offline usage
- **Setup**: 
  1. Install Ollama from [ollama.ai](https://ollama.ai)
  2. Pull models: `ollama pull llama3`
  3. Set CORS: `$env:OLLAMA_ORIGINS='*'` (PowerShell)
  4. Install RMG Ollama Bridge Chrome extension
  5. Select "Ollama" provider in SCRP
- **Cost**: **100% Free** - runs on your machine
- **Privacy**: ✅ No data sent to cloud, complete privacy
- **Performance**: Fast on modern hardware (GPU recommended)

### OpenAI
- **Models**: GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- **Best For**: High-quality summaries, complex content
- **Get Key**: [platform.openai.com](https://platform.openai.com)
- **Cost**: Paid API, usage-based pricing

### Anthropic
- **Models**: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **Best For**: Long-form content, nuanced understanding
- **Get Key**: [console.anthropic.com](https://console.anthropic.com)
- **Cost**: Paid API, usage-based pricing

### HuggingFace
- **Models**: BART, Pegasus, DistilBART
- **Best For**: Free usage, good quality summaries
- **Get Key**: [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
- **Cost**: Free tier available

### Storing Keys in LDGR

1. Navigate to **LDGR** → **API Keys** tab
2. Click **"+ Add Key"**
3. Select your provider
4. Enter a descriptive name
5. Paste your API key
6. Keys are encrypted with **AES-256** using your email as salt
7. Access keys from any RMG application

---

## Architecture

### Tech Stack

**Backend**
- Python 3.13
- FastAPI (REST API)
- BeautifulSoup4 (web scraping)
- youtube-transcript-api (YouTube support)
- PyPDF2 (PDF processing)
- newspaper3k (article extraction)

**Frontend**
- React 18
- Vite (build tool)
- TailwindCSS (styling)
- Lucide React (icons)
- Axios (HTTP client)
- react-markdown (summary rendering)

**AI Integration**
- Ollama (local AI via Chrome extension)
- OpenAI API (GPT-4, GPT-3.5)
- Anthropic API (Claude 3)
- HuggingFace API (BART, Pegasus)

**Integration**
- Supabase (authentication & database)
- LDGR (API key storage & scrape history)
- PostMessage API (cross-origin auth)
- RMG Ollama Bridge (Chrome extension for local AI)

**Deployment**
- Backend: Render
- Frontend: Render
- Integrated in: Ronin Media Group (Netlify)

### Security Architecture

```
┌─────────────────────────────────────────────────┐
│              Ronin Media Group                  │
│  ┌──────────────────────────────────────────┐  │
│  │             LDGR (API Keys)              │  │
│  │  • AES-256 Encryption                    │  │
│  │  • Email-based Key Derivation            │  │
│  │  • Row-Level Security                    │  │
│  └──────────────────────────────────────────┘  │
│                      ↓                          │
│         PostMessage (Auth Token)                │
│                      ↓                          │
│  ┌──────────────────────────────────────────┐  │
│  │          SCRP (iframe)                   │  │
│  │  • Receives Auth Token                   │  │
│  │  • Fetches Encrypted Keys                │  │
│  │  • Client-Side Decryption                │  │
│  │  • Sends to Backend                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Authentication Issues

**Problem**: "Not authenticated. Please log in through RMG."

**Solution**:
1. Ensure you're logged into RMG
2. Refresh the SCRP page
3. Check browser console for auth errors
4. Clear browser cache and try again

### API Key Issues

**Problem**: "No API keys found in LDGR"

**Solution**:
1. Navigate to LDGR → API Keys tab
2. Add at least one API key for your chosen provider
3. Ensure key is marked as "Active"
4. Return to SCRP and refresh

**Problem**: "Failed to decrypt API key"

**Solution**:
1. Verify you're logged in with the same account that created the key
2. Keys are encrypted with your email - must use same email
3. Try re-adding the key in LDGR

### Content Scraping Issues

**Problem**: YouTube video fails to scrape

**Solution**:
- Video must have captions/transcripts enabled
- Some videos have transcripts disabled by creator
- Try a different video

**Problem**: PDF fails to process

**Solution**:
- PDF must be publicly accessible (no auth required)
- Some PDFs are image-based and can't be extracted
- Try a text-based PDF

**Problem**: Article extraction incomplete

**Solution**:
- Some sites use heavy JavaScript rendering
- Paywalled content may not be accessible
- Try the direct article URL, not homepage

### Ollama Issues

**Problem**: "Ollama not detected" or 403 Forbidden

**Solution**:
1. Ensure Ollama is running: `ollama serve`
2. Set CORS environment variable (see setup above)
3. Restart Ollama after setting CORS
4. Reload RMG Ollama Bridge extension
5. Check extension version is 1.0.1 or higher

**Problem**: Models not appearing in dropdown

**Solution**:
1. Pull models first: `ollama pull llama3`
2. Verify models: `ollama list`
3. Reload the extension
4. Refresh SCRP page

### Rate Limits

- **Ollama**: No limits - runs locally!
- **OpenAI**: Usage-based limits, check your account
- **Anthropic**: Usage-based limits, check your account  
- **HuggingFace**: Free tier has generous limits

**Tip**: Use Ollama for unlimited free usage with complete privacy!

---

## Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Areas for Contribution**:
- Additional AI provider support
- New content source types
- UI/UX improvements
- Documentation enhancements
- Bug fixes

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Links

- **Live Demo**: [scraper-frontend-3hnj.onrender.com](https://scraper-frontend-3hnj.onrender.com)
- **RMG Studio**: [roninmedia.studio](https://roninmedia.studio)
- **GitHub**: [github.com/54MUR-AI/scraper](https://github.com/54MUR-AI/scraper)
- **RMG Main**: [github.com/54MUR-AI/RMG](https://github.com/54MUR-AI/RMG)
- **Ollama**: [ollama.ai](https://ollama.ai)

---

**Built with 🗡️ by Ronin Media Group**

*Smart Content Retrieval & Processing*
