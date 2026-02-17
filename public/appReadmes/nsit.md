# 🎯 N-SIT — Networked Strategic Intelligence Tool

A real-time multi-domain intelligence dashboard covering **conflict monitoring**, **financial markets**, **global politics**, **supply chain logistics**, and **natural disasters**. Built with React + TypeScript, featuring 50+ interactive widgets across five operational tabs, live data from 15+ APIs, AI-powered threat assessment, and interactive maps.

---

## 🗂️ Tabs

N-SIT is organized into five specialized intelligence domains. Each tab has its own detailed README served dynamically via the RMG footer.

| Tab | Widgets | Focus |
|-----|---------|-------|
| ⚔️ **Conflicts** | 12+ | Military aircraft, naval vessels, conflict events, cyber threats, hotspots, AI threat assessment |
| 💹 **Economics** | 20+ | Stocks, crypto, commodities, forex, macro indicators, AI market analysis, prediction markets |
| 🏛️ **Politics** | 7+ | Governance mapping, elections, executive actions, sanctions, political news |
| 🚢 **Logistics** | 8+ | Shipping chokepoints, supply chain intel, vessel tracking, semiconductor & commodity markets |
| 🌋 **Disasters** | 8+ | Earthquakes, storms, volcanoes, space weather, wildfires, humanitarian alerts |

---

## ⚙️ Tech Stack

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

---

## 🔌 Data Sources

| API | Auth | Used By |
|-----|------|---------|
| OpenSky Network | LDGR key (or anon) | Aircraft Tracker, Airbase Monitor |
| Digitraffic AIS | Public | Vessel Tracker, Chokepoint Monitor |
| ACLED (via scrp-api) | Server-side | Conflict Events, Civilian Tracker |
| GDELT (via scrp-api) | Public | News, Cyber Intel, Supply Chain |
| NASA FIRMS | LDGR key (or open) | Hotspot / Wildfire Detection |
| CIRCL CVE | Public | Cyber Threats |
| Yahoo Finance | Proxy | Stocks, Commodities, Forex |
| CoinGecko | LDGR Pro key (or free) | Crypto widgets |
| FRED API | LDGR key required | Macro Dashboard, Econ Calendar |
| Polymarket | Public | Prediction Markets |
| USGS Earthquake | Public | Earthquake Tracker |
| GDACS | Public | Storms, Volcanoes, Tsunamis |
| NOAA SWPC | Public | Space Weather |
| ReliefWeb | Public | Humanitarian Alerts |
| Ollama | Local (RMG Bridge) | AI Briefing, Predictions, Threat Assessment |

---

## 🔄 API Proxy

All external API calls route through `/api/*` proxy paths:

- **Dev:** Vite server proxy (`vite.config.ts`)
- **Prod:** Render `_redirects` rewrite rules

---

## 🔐 LDGR Key Management

Premium API access is managed through the LDGR encrypted key vault (Supabase + AES-256-GCM + PBKDF2). Keys are fetched and decrypted client-side via `src/lib/ldgrBridge.ts`.

| Service | Purpose |
|---------|---------|
| `opensky` | OpenSky OAuth2 credentials |
| `coingecko` | CoinGecko Pro API key |
| `nasa-firms` | NASA FIRMS MAP_KEY |
| `fred` | FRED API key |
| `faa-notam` | FAA NOTAM API credentials |

---

## 💾 Session Persistence

All user selections and layouts persist across sessions via `localStorage`:

- **Layouts** — Drag/resize positions saved per breakpoint (versioned)
- **Widget visibility** — Show/hide toggles per device class
- **Active tab** — Last selected tab restored on reload
- **AI settings** — Provider, model, and API key selections
- **Widget state** — Chart symbols, filters, sort preferences, map layers, view modes

---

## 📊 Pipeline Status

Each data source has a tracked pipeline state: `idle → loading → ok | rate-limited | error | stale`. Widget footers show live status with free/premium tier indicators.

---

## 🛠️ Development

```bash
npm install
npm run dev          # Start dev server on port 5180
npm run build        # TypeScript check + Vite build
npm run build:quick  # Vite build only (skip tsc)
```

---

## 🏗️ Project Structure

```
src/
├── lib/
│   ├── api.ts              # Proxy URLs + CoinGecko rate limiter
│   ├── conflictApi.ts      # OpenSky, ACLED, FIRMS, AIS, CVE, NOTAMs
│   ├── politicsApi.ts      # Governance, elections, ideology data
│   ├── logisticsApi.ts     # Supply chain, chokepoints, shipping
│   ├── disasterApi.ts      # USGS, GDACS, NOAA, ReliefWeb
│   ├── yahooFinance.ts     # Yahoo Finance fetcher + cache
│   ├── fred.ts             # FRED API + Supabase cache
│   ├── ldgrBridge.ts       # LDGR auth + key decryption
│   ├── ollamaProxy.ts      # Ollama bridge (postMessage)
│   ├── persist.ts          # localStorage helpers (loadSetting/saveSetting)
│   ├── pipelineStatus.ts   # Data pipeline state tracking
│   └── widgetRegistry.ts   # Widget metadata + layout persistence
├── components/
│   ├── conflict/           # Conflict tab widgets + dashboard
│   ├── politics/           # Politics tab widgets + dashboard
│   ├── logistics/          # Logistics tab widgets + dashboard
│   ├── disasters/          # Disasters tab widgets + dashboard
│   ├── [Economy widgets]   # 20+ economy tab widgets (root level)
│   ├── WidgetPanel.tsx     # Reusable widget container
│   └── SettingsPanel.tsx   # AI model selector + widget visibility
├── App.tsx                 # Main layout + tab routing + grid
└── index.css               # Tailwind + samurai dark theme
```

---

## 🌐 RMG Integration

N-SIT is embedded in [RMG](https://roninmedia.studio) via iframe at `/nsit`. Auth tokens are received via `postMessage`. The active tab name is communicated to the RMG footer, which dynamically serves the tab-specific README when the 📖 button is clicked.

---

## 📄 License

Part of the RMG (Ronin Media Group) ecosystem.
