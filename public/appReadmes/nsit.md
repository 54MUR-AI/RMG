# N-SIT — Networked Strategic Intelligence Tool

A real-time multi-domain intelligence dashboard covering **conflict monitoring**, **financial markets**, and **global logistics**. Built with React + TypeScript, featuring 37+ interactive widgets across three operational tabs, live data from 12+ APIs, AI-powered threat assessment, and interactive maps.

## Tabs & Widgets

### Conflict Tab (12 widgets)

| Widget | Data Source | Description |
|--------|-----------|-------------|
| **Global Conflict Map** | All conflict APIs | MapLibre GL JS interactive map with aircraft, vessels, events, hotspots, cyber events, NFZ zones, airbases, NOTAMs |
| **Threat Assessment** | GDELT + CVE + Ollama | AI-generated threat briefing with hot zones and threat level (requires Ollama) |
| **Aircraft Tracker** | OpenSky Network | Live military aircraft positions filtered by ICAO24 hex prefixes (15 NATO+ nations) |
| **Vessel Tracker** | Digitraffic AIS | Real-time vessel positions (Baltic/Nordic focus); filterable by type, flag, speed |
| **Conflict Events** | GDELT via scrp-api | Conflict events mapped to country centroids (85+ countries) with event type classification |
| **Conflict Intel** | GDELT via scrp-api | 30 conflict news articles from the last 24 hours |
| **Cyber Threats** | CIRCL CVE + GDELT | Latest CVEs (CVSS scored) + cyber threat news (ransomware, APT, breach, DDoS) |
| **Hotspot Detection** | NASA FIRMS | Satellite fire/hotspot detection (VIIRS SNPP); high-confidence filter |
| **Defense Stocks** | Yahoo Finance | 8 defense sector tickers: RTX, LMT, NOC, BA, GD, HII, LHX, LDOS |
| **Nuclear Threat Level** | Static (Doomsday Clock) | Bulletin of the Atomic Scientists clock + DEFCON indicators |
| **Airbase Monitor** | OpenSky flights API | Arrival/departure activity for 26 military airbases worldwide |
| **GIS Overlays** | User-uploaded | GeoJSON/KML file upload for custom map layers |

### Economy Tab (20+ widgets)

| Widget | Data Source | Description |
|--------|-----------|-------------|
| **Stock Ticker Tape** | Yahoo Finance | Scrolling tape with simulated micro-updates between fetches |
| **Crypto Ticker Tape** | CoinGecko (shared) | Top 20 coins by market cap with 24h change |
| **Global Indices** | Yahoo Finance | S&P 500, Dow, NASDAQ, Russell 2000, FTSE, DAX, CAC 40, Nikkei, Shanghai, HSI, Sensex |
| **Commodities & Metals** | Yahoo Finance | Gold, Silver, Platinum, Palladium, Copper + WTI, Brent, NatGas + Gold/Silver Ratio |
| **Forex & Bonds** | Yahoo Finance | DXY + 7 forex pairs + 4 US Treasury yields (3M, 5Y, 10Y, 30Y) |
| **Crypto Overview** | CoinGecko Global | Total market cap, 24h volume, BTC/ETH dominance |
| **Fear & Greed Gauge** | alternative.me | Animated SVG gauge with sentiment classification |
| **AI Briefing** | Ollama via RMG Bridge | Market sentiment analysis with LLM deep dive (cached 24h to Supabase) |
| **Breaking News** | RSS via rss2json | 10 sources: CoinDesk, CoinTelegraph, MarketWatch, BBC, NYT, CNBC, WSJ, Al Jazeera, Defense One, The War Zone |
| **Prediction Markets** | Polymarket Gamma API | Top 20 live prediction market events with odds |
| **Macro Dashboard** | FRED API | 8 series: Fed Funds Rate, CPI, Unemployment, Yield Curve, GDP, M2, Dollar Index, VIX |
| **Economic Calendar** | Static + FRED | FOMC, CPI, Jobs, GDP dates through 2026 with FRED backfill for actuals |
| **Top Movers** | CoinGecko (shared) | Top crypto gainers/losers from shared cache |
| **AI Predictions** | Ollama + Yahoo + FRED | AI-generated market predictions with confidence scores |
| **Charts (Candlestick)** | Yahoo Finance OHLC | Symbol search, multiple intervals/ranges, lightweight-charts |
| **Crypto Heatmap** | CoinGecko Markets | Treemap of top 50 coins by market cap |
| **Watchlist** | Yahoo Finance + local | User-configurable ticker list (localStorage) |
| **Price Alerts** | Yahoo Finance + local | Browser notifications + audio alerts |
| **Sector Performance** | Yahoo Finance | S&P 500 sector ETFs heatmap |
| **Currency Strength** | Yahoo Finance | Relative strength meter for major currencies |
| **Portfolio Tracker** | Yahoo Finance + local | Holdings, P&L, allocation visualization |
| **Market Sessions** | Static + clock | Global exchange open/close times with 24h timeline |

### Logistics Tab (6 widgets)

| Widget | Data Source | Description |
|--------|-----------|-------------|
| **Chokepoint Map** | Canvas overlay | 12 global shipping chokepoints with shipping lanes, subsea cables, cable landings |
| **Chokepoint Monitor** | GDELT + Digitraffic AIS | GDELT sentiment analysis infers disruption status; AIS vessel counts near chokepoints |
| **Supply Chain Intel** | GDELT via scrp-api | 40 articles, 7-day window, categorized by sector (shipping, semiconductor, energy, food, trade) |
| **Shipping Stocks** | Yahoo Finance | 10 tickers: ZIM, MATX, DAC, GOGL, SBLK, FRO, STNG, UPS, FDX, XPO |
| **Semiconductor Tracker** | Yahoo Finance | 8 tickers: TSM, ASML, NVDA, AMD, INTC, AVGO, MU, QCOM |
| **Food & Energy Security** | Yahoo Finance | 6 food commodity futures + 3 energy futures |

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite 6
- **Styling:** Tailwind CSS (samurai dark theme)
- **Layout:** react-grid-layout (drag/resize/save per breakpoint)
- **Maps:** MapLibre GL JS + canvas overlays
- **Charts:** Recharts + D3 + lightweight-charts
- **Icons:** Lucide React
- **AI:** Ollama via RMG Bridge Extension (postMessage protocol)
- **Auth:** LDGR Bridge (AES-256-GCM encrypted API keys via Supabase)
- **Cache:** In-memory + Supabase (AI cache, 24h TTL)
- **Hosting:** Render (Static Site)

## Data Sources & APIs

| API | Auth | Rate Limit | Used By |
|-----|------|-----------|---------|
| **OpenSky Network** | OAuth2 via LDGR (or anonymous) | 4,000 credits/day (auth) · ~100/day (anon) | Aircraft Tracker, Airbase Monitor |
| **Digitraffic AIS** | None (public) | Reasonable use | Vessel Tracker, Chokepoint Monitor |
| **GDELT** | None (via scrp-api proxy) | Public | Conflict Events/News, Cyber News, Supply Chain, Chokepoints |
| **NASA FIRMS** | LDGR key (or open NRT) | Generous | Hotspot Detection |
| **CIRCL CVE** | None (via proxy) | Public | Cyber Threats |
| **Yahoo Finance** | None (via proxy) | Rate limited | All stock/commodity/forex widgets |
| **CoinGecko** | LDGR Pro key (or free) | 10-30 req/min (free) · 500/min (pro) | Crypto widgets |
| **FRED** | LDGR key required | 120 req/min | Macro Dashboard, Economic Calendar |
| **Polymarket** | None (Gamma API) | Public | Prediction Markets |
| **Fear & Greed** | None (alternative.me) | Public | Fear & Greed Gauge |
| **RSS (rss2json)** | None | 10k req/day | Breaking News |
| **FAA NOTAMs** | LDGR key (client_id + client_secret) | Rate limited | Conflict Map NOTAMs |
| **Ollama** | Local (via RMG Bridge Extension) | Local | Threat Assessment, AI Briefing, AI Predictions |
| **SCRP API** | None | Backend proxy | GDELT routing, article scraping/summarization |

## API Proxy

All external API calls route through `/api/*` proxy paths:
- **Dev:** Vite server proxy (`vite.config.ts`)
- **Prod:** Render `_redirects` rewrite rules

| Proxy Path | Target |
|------------|--------|
| `/api/coingecko/*` | `api.coingecko.com` |
| `/api/polymarket/*` | `gamma-api.polymarket.com` |
| `/api/fng/*` | `api.alternative.me` |
| `/api/rss/*` | `api.rss2json.com` |
| `/api/yahoo/*` | `query2.finance.yahoo.com` |
| `/api/fred/*` | `api.stlouisfed.org` |
| `/api/cve/*` | `cve.circl.lu` |
| `/api/firms/*` | `firms.modaps.eosdis.nasa.gov` |

## LDGR Key Management

Premium API access is managed through the LDGR encrypted key vault (Supabase + AES-256-GCM + PBKDF2). Keys are fetched and decrypted client-side via `src/lib/ldgrBridge.ts`.

| LDGR Service Name | Purpose |
|-------------------|---------|
| `opensky` | OpenSky OAuth2 (keyName=client_id, key=client_secret) |
| `coingecko` | CoinGecko Pro API key |
| `nasa-firms` | NASA FIRMS MAP_KEY |
| `fred` | FRED API key |
| `faa-notam` | FAA NOTAM API (keyName=client_id, key=client_secret) |

## Pipeline Status

Each data source has a tracked pipeline state (`src/lib/pipelineStatus.ts`): `idle → loading → ok | rate-limited | error | stale`. Widget footers show live status with free/premium tier indicators.

## Development

```bash
npm install
npm run dev          # Start dev server on port 5180
npm run build        # TypeScript check + Vite build
npm run build:quick  # Vite build only (skip tsc)
```

## RMG Integration

N-SIT is embedded in the [RMG](https://roninmedia.studio) platform via iframe at the `/nsit` route. Auth tokens are received via `postMessage` from the parent frame. The Ollama AI bridge communicates through the RMG Browser Extension using the same `postMessage` protocol.

## Project Structure

```
src/
├── lib/
│   ├── api.ts              # Proxy URL helpers + CoinGecko rate limiter
│   ├── conflictApi.ts      # OpenSky, GDELT events, FIRMS, AIS, CVE, NOTAMs, NFZ
│   ├── logisticsApi.ts     # Supply chain news, chokepoints, shipping tickers
│   ├── yahooFinance.ts     # Yahoo Finance v8 fetcher + batch + cache + simulation
│   ├── fred.ts             # FRED API + multi-proxy + Supabase cache
│   ├── ldgrBridge.ts       # LDGR auth + API key decryption (AES-256-GCM)
│   ├── ollamaProxy.ts      # Ollama bridge via RMG extension (postMessage)
│   ├── scrpBridge.ts       # SCRP backend for article scraping/summarization
│   ├── pipelineStatus.ts   # Centralized data pipeline state tracking
│   ├── aiCache.ts          # Supabase-backed AI response cache (24h TTL)
│   ├── predictionEngine.ts # AI prediction context builder
│   ├── widgetRegistry.ts   # Widget metadata registry
│   └── supabase.ts         # Supabase client
├── components/
│   ├── conflict/           # 12 conflict tab widgets + ConflictDashboard
│   ├── logistics/          # 6 logistics tab widgets + LogisticsDashboard
│   ├── [Economy widgets]   # 20+ economy tab widgets
│   ├── WidgetPanel.tsx     # Reusable widget container with pipeline status
│   └── SettingsPanel.tsx   # Ollama model selector + widget visibility
├── App.tsx                 # Main layout + tab routing + grid
├── main.tsx                # Entry point
└── index.css               # Tailwind + samurai dark theme + MapLibre overrides
```

## Deployment

Auto-deploys from `master` branch via Render.

## License

Part of the RMG (Ronin Media Group) ecosystem.
