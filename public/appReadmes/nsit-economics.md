# 💹 N-SIT — Economics

Real-time financial markets dashboard with 20+ widgets covering stocks, crypto, commodities, forex, macro indicators, and AI-powered market analysis.

---

## 📊 Stock Ticker Tape

Scrolling marquee of major stock indices and popular tickers via **Yahoo Finance**. Simulated micro-updates between fetches keep the tape feeling alive.

---

## 🪙 Crypto Ticker Tape

Top 20 cryptocurrencies by market cap from **CoinGecko** (shared cache). Shows price, 24h change, and market cap rank.

---

## 🌍 Global Indices

Real-time quotes for 11 major indices:

`S&P 500` · `Dow Jones` · `NASDAQ` · `Russell 2000` · `FTSE 100` · `DAX` · `CAC 40` · `Nikkei 225` · `Shanghai Composite` · `Hang Seng` · `Sensex`

---

## 🏗️ Commodities & Metals

Precious metals and energy futures via **Yahoo Finance**:

- **Metals** — Gold, Silver, Platinum, Palladium, Copper + Gold/Silver Ratio
- **Energy** — WTI Crude, Brent Crude, Natural Gas

---

## 💱 Forex & Bonds

- **Dollar Index (DXY)** + 7 major forex pairs
- **US Treasury Yields** — 3-Month, 5-Year, 10-Year, 30-Year

---

## 🌐 Crypto Overview

Global crypto market stats from **CoinGecko**:

- Total market cap & 24h volume
- BTC & ETH dominance percentages
- Active cryptocurrencies count

---

## 😱 Fear & Greed Gauge

Animated SVG gauge from **alternative.me** — classifies market sentiment from Extreme Fear to Extreme Greed with a smooth needle animation.

---

## 🤖 AI Briefing

Local AI-powered market analysis via **Ollama** (RMG Bridge Extension):

- Synthesizes market data, news sentiment, and macro indicators
- Generates a structured briefing with key takeaways
- **Deep Dive** mode for extended analysis
- Cached to Supabase for 24h to avoid redundant LLM calls

---

## 📰 Breaking News

Live RSS feed from **10 sources**:

`CoinDesk` · `CoinTelegraph` · `MarketWatch` · `BBC` · `NYT` · `CNBC` · `WSJ` · `Al Jazeera` · `Defense One` · `The War Zone`

Filter by category: Crypto, Markets, Macro, Defense. Click any headline to open the built-in article reader with AI translation and bias analysis.

---

## 🔮 Prediction Markets

Top live events from **Polymarket** (Gamma API) with real-time odds and volume. See what the market thinks about upcoming events.

---

## 📉 Macro Dashboard

8 key economic indicators from the **FRED API** (requires LDGR API key):

- Fed Funds Rate · CPI · Unemployment Rate · Yield Curve Spread
- GDP Growth · M2 Money Supply · Dollar Index · VIX

Click any indicator card to view its historical chart. Your selected series **persists across sessions**.

---

## 📅 Economic Calendar

Upcoming economic events through 2026:

- **FOMC** meetings, **CPI** releases, **Jobs** reports, **GDP** prints, **Earnings** dates
- Countdown timers with urgency indicators
- FRED backfill for actual values on past events (requires LDGR key)

---

## 🚀 Top Movers

Biggest gainers, losers, and volume leaders across stocks and crypto. Data from **Yahoo Finance** + **CoinGecko** shared cache. Includes sparkline charts.

---

## 🧠 AI Predictions

AI-generated market predictions via **Ollama**:

- Combines Yahoo Finance data, FRED macro indicators, and market sentiment
- Generates predictions with confidence scores
- Cached to Supabase for 24h

---

## 📈 Candlestick Charts

Full-featured charting powered by **lightweight-charts**:

- Search any ticker symbol
- Preset symbols: S&P 500, NASDAQ, BTC, ETH, Gold, Oil
- Multiple timeframes: 1D, 5D, 1M, 3M, 6M, 1Y, 5Y
- OHLCV data from Yahoo Finance

Your selected symbol and timeframe **persist across sessions**.

---

## 🗺️ Crypto Heatmap

Treemap visualization of the top 50 cryptocurrencies by market cap. Color-coded by 24h price change — green for gains, red for losses.

---

## 👀 Watchlist

User-configurable ticker watchlist with live quotes from **Yahoo Finance**. Add any stock or crypto symbol. Stored in localStorage.

---

## 🔔 Price Alerts

Set price alerts on any ticker — get **browser notifications** and audio alerts when targets are hit. Configurable above/below thresholds.

---

## 🏭 Sector Performance

S&P 500 sector ETF heatmap — see which sectors are leading or lagging in real-time.

---

## 💪 Currency Strength

Relative strength meter for major currencies (USD, EUR, GBP, JPY, CHF, AUD, CAD, NZD). Calculated from cross-pair performance.

---

## 💼 Portfolio Tracker

Track your holdings with P&L and allocation visualization:

- **Stocks** — Add any ticker with quantity and cost basis
- **Crypto** — Manual entries or auto-import from LDGR crypto wallets
- **Metals** — Gold, Silver, Platinum, Palladium via Yahoo futures
- Authenticated users sync to Supabase; anonymous users use localStorage

---

## 🕐 Market Sessions

Global exchange open/close times with a 24-hour timeline. See at a glance which markets are currently trading.

---

## ⚙️ Data Sources

| Source | Auth | Refresh |
|--------|------|---------|
| Yahoo Finance | Proxy | 1–5 min |
| CoinGecko | LDGR Pro key (or free) | 3 min |
| FRED API | LDGR key required | 10 min |
| Polymarket | Public | 5 min |
| alternative.me | Public | 5 min |
| RSS (rss2json) | Public | 5 min |
| Ollama | Local (RMG Bridge) | On demand |

---

*Part of [N-SIT](https://github.com/54MUR-AI/inst) — Networked Strategic Intelligence Tool*
