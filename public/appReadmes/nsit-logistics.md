# 🚢 N-SIT — Logistics

Global supply chain intelligence with chokepoint monitoring, vessel and aircraft tracking, shipping lane visualization, and commodity market analysis.

---

## 🗺️ Global Shipping Chokepoints

Interactive **MapLibre GL JS** map centered on the world's 12 critical maritime chokepoints:

- **Suez Canal** · **Panama Canal** · **Strait of Hormuz** · **Strait of Malacca**
- **Bab el-Mandeb** · **Turkish Straits** · **Gibraltar** · **Danish Straits**
- **Cape of Good Hope** · **Lombok Strait** · **Taiwan Strait** · **English Channel**

Each chokepoint shows status (Normal / Disrupted / Critical), daily traffic volume, and percentage of global trade. Pulsing indicators for disrupted or critical chokepoints.

### Map Overlays

Toggle via the **Layers** panel:

- **🛳️ Shipping Lanes** — Major global shipping routes rendered as cyan lines
- **🔌 Subsea Cables** — Submarine telecommunications cable routes in purple
- **📍 Cable Landings** — Physical cable landing points
- **✈️ Aircraft** — Live civilian aircraft positions from OpenSky
- **🚢 Vessels** — Live AIS vessel positions, color-coded by type

All overlay selections **persist across sessions**.

---

## ⚠️ Chokepoint Status

Real-time disruption monitoring for all 12 chokepoints:

- **GDELT Sentiment** — News sentiment analysis infers disruption likelihood
- **AIS Vessel Counts** — Live vessel density near each chokepoint
- **News Hits** — Recent article count mentioning each chokepoint
- Status auto-updates every **10 minutes**

---

## ✈️ Aircraft Tracker

Live civilian aircraft tracking from **OpenSky Network**:

- Filters out military aircraft (shown on the Conflicts tab instead)
- Callsign, altitude, speed, heading, and ICAO24 details
- Useful for monitoring air cargo and commercial aviation patterns

---

## 🚢 Vessel Tracker

Real-time vessel surveillance from **Digitraffic AIS** and **AISHub**:

- Color-coded by vessel type: Tanker (purple), Cargo (cyan), Passenger (green), Fishing (gray)
- Filter by type, flag state, speed, and navigation status
- Click for MMSI, destination, callsign details
- Shared data cache with the Conflicts tab — no extra API calls

---

## 📰 Supply Chain Intel

Curated supply chain news from **GDELT** via scrp-api:

- 40 articles from a 7-day window
- Categorized by sector: **Shipping**, **Semiconductor**, **Energy**, **Food**, **Trade**
- Click any headline for the full article with AI translation and bias analysis

---

## 📈 Shipping & Logistics Stocks

Real-time quotes for 10 shipping and logistics tickers via **Yahoo Finance**:

`ZIM` · `MATX` · `DAC` · `GOGL` · `SBLK` · `FRO` · `STNG` · `UPS` · `FDX` · `XPO`

---

## 🔧 Semiconductor Supply

Tracking the chip supply chain with 8 key semiconductor stocks:

`TSM` · `ASML` · `NVDA` · `AMD` · `INTC` · `AVGO` · `MU` · `QCOM`

---

## 🌾 Food & Energy Security

Commodity futures tracking for food and energy security:

- **Food** — Corn, Wheat, Soybeans, Sugar, Coffee, Cocoa
- **Energy** — WTI Crude, Brent Crude, Natural Gas

---

## ⚙️ Data Sources

| Source | Auth | Refresh |
|--------|------|---------|
| OpenSky Network | LDGR key (or anon) | 1 min |
| Digitraffic AIS | Public | 2 min |
| AISHub (via scrp-api) | Server-side | 2 min |
| GDELT | Public | 10 min |
| Yahoo Finance | Proxy | 5 min |
| Shipping Lanes GeoJSON | Static | On load |
| Subsea Cables GeoJSON | Static | On load |

---

*Part of [N-SIT](https://github.com/54MUR-AI/inst) — Networked Strategic Intelligence Tool*
