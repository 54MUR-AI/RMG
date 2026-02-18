# 🗡️ Ronin Media Group

**Your AI-Powered Digital Arsenal**

A comprehensive suite of AI-powered tools for intelligence, security, and research. Built with React + TypeScript + Tailwind CSS, integrated with local AI models via Ollama, and secured with client-side AES-256-GCM encryption.

**Live:** [https://roninmedia.studio](https://roninmedia.studio)
**GitHub:** [54MUR-AI](https://github.com/54MUR-AI)

## 🚀 Applications

### 🎯 N-SIT (Networked Strategic Intelligence Tool)
**Multi-domain intelligence dashboard** — [nsit-rmg.onrender.com](https://nsit-rmg.onrender.com) — [GitHub](https://github.com/54MUR-AI/inst)

- 50+ widgets across 5 tabs: Economy, Conflicts, Politics, Logistics, Disasters
- 20+ live data sources (ACLED, Yahoo Finance, CoinGecko, Kalshi, Polymarket, USGS, GDACS, NOAA, NASA FIRMS, OpenSky, AIS, FRED, etc.)
- AI-powered briefings, predictions, threat assessment, and disaster forecasting via Ollama
- Interactive MapLibre maps with conflict heatmaps, aircraft/vessel tracking, and GIS overlays
- Dual-exchange prediction markets (Polymarket + Kalshi) for economics and politics
- Portfolio tracker integrated with LDGR assets and crypto wallets

### 🔐 LDGR (Layered Decentralized Global Registry)
**Encrypted vault** — embedded in RMG at `/ldgr`

- **Password Manager** — AES-256-GCM encrypted storage with strength analysis
- **Crypto Wallets** — Multi-chain (ETH, BTC, SOL, MATIC, BSC, AVAX, ADA, XRP) with live balances
- **Asset Tracker** — Stocks, ETFs, metals, tokenized assets with Yahoo Finance pricing
- **API Keys** — Centralized encrypted key management used by all RMG apps
- **Files** — Encrypted file storage in Supabase Storage

### 🤖 OMNI (Optimized Multi-Model Networked Intelligence)
**AI chat platform** — [omni-rmg.onrender.com](https://omni-rmg.onrender.com) — [GitHub](https://github.com/54MUR-AI/omni_lite)

- Multi-provider: Ollama (local), OpenAI GPT-4, Anthropic Claude, Google Gemini, Hugging Face
- Conversation history, model switching, markdown rendering with syntax highlighting
- LDGR API key integration for cloud providers

### 📰 SCRP (Smart Content Retrieval & Processing)
**Web scraper + API proxy** — [scrp-rmg.onrender.com](https://scrp-rmg.onrender.com) — [GitHub](https://github.com/54MUR-AI/scraper)

- AI-powered scraping and summarization (articles, YouTube, PDFs)
- Backend proxy for N-SIT data pipelines (ACLED, GDELT, FRED, Yahoo Finance, Federal Register, Polymarket)
- Server-side SWR cache to protect upstream API rate limits
- Article analysis: AI translation, source extraction, bias detection

### 📡 WSPR (Web-Secure P2P Relay)
**Encrypted messaging** — [wspr-rmg.onrender.com](https://wspr-rmg.onrender.com) — [GitHub](https://github.com/54MUR-AI/wspr-web)

- End-to-end encrypted DMs (AES-256-GCM)
- Workspace channels with real-time delivery
- Typing indicators, presence, emoji reactions, message search
- LDGR file sharing integration

### 🎨 FORGE
**AI Content Generation**

- Text generation, image creation, code assistance
- Integrated with Ollama and cloud AI providers

---

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    RMG (Parent App)                      │
│  roninmedia.studio                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │  N-SIT   │ │  OMNI    │ │  SCRP    │ │  WSPR    │  │
│  │ (iframe) │ │ (iframe) │ │ (iframe) │ │ (iframe) │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │
│       │ postMessage  │            │            │         │
│  ┌────┴─────────────┴────────────┴────────────┴─────┐  │
│  │              Supabase (shared)                    │  │
│  │  auth · api_keys · ldgr_assets · crypto_wallets   │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │           LDGR (embedded at /ldgr)               │   │
│  │  Passwords · Assets · Wallets · API Keys · Files │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                              │
    RMG Ollama Bridge              scrp-api proxy
    (Chrome Extension)          (ACLED, GDELT, FRED,
    localhost:11434 →            Yahoo, Polymarket)
    local Ollama models
```

### Render Services

| App | Frontend | Backend | GitHub |
|-----|----------|---------|--------|
| N-SIT | nsit-rmg.onrender.com | (proxy rewrite rules) | 54MUR-AI/inst |
| SCRP | scrp-rmg.onrender.com | scrp-api.onrender.com | 54MUR-AI/scraper |
| WSPR | wspr-rmg.onrender.com | wspr-api.onrender.com | 54MUR-AI/wspr-web |
| OMNI | omni-rmg.onrender.com | omni-api.onrender.com | 54MUR-AI/omni_lite |
| LDGR | (embedded in RMG) | — | (part of RMG) |

### Auth Flow (postMessage)

1. User logs into RMG (Supabase Auth / GitHub OAuth)
2. RMG embeds child apps in iframes via `{App}Page.tsx`
3. Parent sends `RMG_AUTH_TOKEN` via `postMessage` on iframe load
4. Child app stores token, decrypts LDGR API keys client-side
5. All apps share the same Supabase project with user-scoped RLS

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS with custom Samurai theme
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Markdown**: react-markdown with syntax highlighting

### Backend & Services
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (GitHub OAuth)
- **Storage**: Supabase Storage
- **Encryption**: Web Crypto API (AES-GCM)

### AI Integration
- **Local AI**: Ollama via Chrome Extension Bridge
  - Models: Llama 3, Mistral, Qwen3-VL, TinyLlama, LLaVA
  - No API keys required
  - Privacy-focused (runs locally)
- **Cloud AI**: OpenAI GPT-4, Anthropic Claude, Google Gemini, Hugging Face
- **Extension**: Custom Chrome extension for Ollama proxy

## 📦 Installation

### Prerequisites
- Node.js 20.19+ or 22.12+
- Supabase account (free tier works)
- Ollama (optional, for local AI)

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/54MUR-AI/RMG.git
cd RMG
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure Supabase**

Create a `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Set up Supabase tables**

Run the SQL migrations in `supabase/migrations/` to create:
- `passwords` - Encrypted password storage
- `crypto_wallets` - Crypto wallet data
- `files` - File metadata
- `api_keys` - API key management
- `scrapes` - Scraped content history

5. **Install Ollama (Optional)**

For local AI models:
```bash
# Windows
winget install Ollama.Ollama

# macOS
brew install ollama

# Linux
curl https://ollama.ai/install.sh | sh
```

Pull models:
```bash
ollama pull llama3
ollama pull mistral
ollama pull qwen3-vl:8b
```

Configure CORS:
```powershell
# Windows PowerShell (as Administrator)
[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
```

6. **Install RMG Ollama Bridge Extension**

Load the extension from `rmg-ollama-bridge/` in Chrome:
- Go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `rmg-ollama-bridge` folder

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The site runs on `http://localhost:5173` by default.

## � GitHub Pages Deployment

This site is configured for automatic deployment to GitHub Pages.

### Setup (One-time):
1. Go to your repository settings
2. Navigate to **Pages** section
3. Under **Build and deployment**:
   - Source: **GitHub Actions**
4. Push to `main` branch to trigger automatic deployment

### Live Site:
Once deployed, your site will be available at:
`https://54mur-ai.github.io/RMG/`

### Manual Deployment:
```bash
npm run build
# The dist/ folder contains the production build
```

## 📁 Project Structure

```
RMG/
├── src/
│   ├── components/
│   │   ├── ldgr/              # LDGR components
│   │   │   ├── PasswordManager.tsx
│   │   │   ├── CryptoWallet.tsx
│   │   │   ├── Files.tsx
│   │   │   └── ApiKeyManager.tsx
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── AuthLockScreen.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── LdgrPage.tsx       # Ledger vault
│   │   ├── OmniPage.tsx       # AI chat
│   │   ├── ScraperPage.tsx    # Web scraper
│   │   ├── WsprPage.tsx       # Messaging
│   │   ├── ForgePage.tsx      # Content gen
│   │   └── StonksPage.tsx     # Finance ML
│   ├── lib/
│   │   ├── supabase.ts        # Supabase client
│   │   └── ldgr/              # LDGR utilities
│   │       ├── passwords.ts
│   │       ├── cryptoWallets.ts
│   │       ├── files.ts
│   │       └── apiKeys.ts
│   ├── contexts/
│   │   └── AuthContext.tsx    # Auth state
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── rmg-ollama-bridge/         # Chrome extension
│   ├── manifest.json
│   ├── background.js
│   └── content.js
├── public/
├── index.html
└── package.json
```

## ✨ Key Features

### 🔐 Security First
- **Client-side encryption** - All sensitive data encrypted before leaving your browser
- **GitHub OAuth** - Secure authentication via GitHub
- **No plaintext storage** - Passwords, seed phrases, and API keys never stored in plaintext
- **Local AI option** - Use Ollama for complete privacy (no data sent to cloud)

### 🎨 Modern UI/UX
- **Samurai theme** - Custom red/black aesthetic with smooth animations
- **Responsive design** - Works on desktop, tablet, and mobile
- **Dark mode native** - Easy on the eyes
- **Glassmorphism** - Modern frosted glass effects
- **Smooth transitions** - Polished user experience

### 🤖 AI Integration
- **Multi-model support** - Switch between GPT-4, Claude, Gemini, and Ollama
- **Local AI via Ollama** - Privacy-focused, no API keys needed
- **Smart summarization** - Concise 3-5 bullet point summaries
- **Context-aware** - Maintains conversation history

### 💾 Data Management
- **Auto-save** - Scraped content automatically saved to LDGR
- **Search & filter** - Find your data quickly
- **Export options** - Download as JSON
- **Batch operations** - Process multiple items at once

## 🔒 Security & Privacy

### Encryption
All sensitive data is encrypted using **AES-GCM** with keys derived from your user email via **PBKDF2** (100,000 iterations). This means:
- ✅ Only you can decrypt your data
- ✅ Even if the database is compromised, your data is safe
- ✅ Supabase admins cannot read your passwords or seed phrases

### Local AI Option
Using Ollama means:
- ✅ AI processing happens on your machine
- ✅ No data sent to OpenAI, Anthropic, or Google
- ✅ No API costs
- ✅ Works offline

## 🎯 Usage

### LDGR - Password Manager
1. Navigate to **LDGR** → **Passwords** tab
2. Click **Add Password**
3. Enter website, username, password, and notes
4. Password strength is automatically analyzed
5. Click **Save** - password is encrypted and stored

### LDGR - Crypto Wallets
1. Navigate to **LDGR** → **Crypto** tab
2. Click **Add Wallet**
3. Select blockchain, enter address and seed phrase
4. Click **Refresh** to fetch live balance
5. View balance in native currency and USD

### SCRP - Web Scraping
1. Navigate to **SCRP**
2. Enter any URL (article, Wikipedia, etc.)
3. Select AI provider (Ollama recommended for privacy)
4. Click **Scrape & Summarize**
5. View structured summary with sources
6. Content auto-saved to LDGR

### OMNI - AI Chat
1. Navigate to **OMNI**
2. Select your preferred AI model
3. Start chatting!
4. Switch models mid-conversation if needed

## 🔗 Links & Resources

### Repositories
- [RMG Main](https://github.com/54MUR-AI/RMG) - This repository (parent app + LDGR)
- [N-SIT](https://github.com/54MUR-AI/inst) - Intelligence dashboard
- [SCRP](https://github.com/54MUR-AI/scraper) - Web scraper + API proxy
- [WSPR](https://github.com/54MUR-AI/wspr-web) - Encrypted messaging
- [OMNI](https://github.com/54MUR-AI/omni_lite) - AI chat platform
- [GitHub Organization](https://github.com/54MUR-AI)

### Live Sites
- [RMG Studio](https://roninmedia.studio) - Main application
- [N-SIT](https://nsit-rmg.onrender.com) - Intelligence dashboard
- [SCRP](https://scrp-rmg.onrender.com) - Web scraper
- [WSPR](https://wspr-rmg.onrender.com) - Messaging
- [OMNI](https://omni-rmg.onrender.com) - AI chat

### Documentation
- [Ollama](https://ollama.ai) - Local AI models
- [Supabase](https://supabase.com) - Backend platform
- [Crypto Libraries TODO](src/lib/ldgr/CRYPTO_LIBRARIES_TODO.md) - Multi-chain import roadmap

## � Troubleshooting

### Ollama 403 Forbidden Error
If you see "403 Forbidden" when using Ollama:

1. Set the `OLLAMA_ORIGINS` environment variable:
```powershell
# Windows PowerShell (as Administrator)
[System.Environment]::SetEnvironmentVariable('OLLAMA_ORIGINS', '*', 'User')
```

2. Restart Ollama:
```bash
ollama serve
```

3. Reload the RMG Ollama Bridge extension in Chrome

### Extension Not Working
1. Go to `chrome://extensions/`
2. Find "RMG Ollama Bridge"
3. Click the reload icon
4. Check that version is **1.0.1** or higher

### Balance Not Loading
- Check that you have a valid API connection
- Some blockchains may have rate limits
- Try refreshing after a few minutes
- Ensure wallet address is correct for the blockchain

### Supabase Connection Issues
- Verify `.env` file has correct credentials
- Check Supabase project is active
- Ensure tables are created (run migrations)

## 🚀 Roadmap

### Planned Features
- [ ] Multi-chain wallet import with real crypto libraries
- [ ] Password generator with custom rules
- [ ] File encryption/decryption in browser
- [ ] Two-factor authentication
- [ ] Backup/restore functionality
- [ ] Mobile app (React Native)
- [ ] Browser extension for password autofill
- [ ] API key rotation automation
- [ ] Collaborative features (shared vaults)

### In Progress
- [x] Ollama integration for local AI
- [x] Crypto wallet balance tracking
- [x] Web scraper with AI summarization
- [x] GitHub OAuth authentication
- [x] Client-side encryption

## �📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🙏 Acknowledgments

- **Ollama** - Local AI models
- **Supabase** - Backend infrastructure
- **Lucide** - Beautiful icons
- **TailwindCSS** - Utility-first styling
- **CoinGecko** - Crypto price data

---

**Built with 🗡️ by Ronin Media Group**

*Your AI-Powered Digital Arsenal*
