# ⚔️ N-SIT — Conflicts

Real-time global conflict monitoring with 14+ widgets: live aircraft tracking, vessel surveillance, ACLED conflict events, CAST 6-month forecasts, cyber threat intelligence, civilian impact tracking, and AI-powered threat assessment.

---

## 🗺️ Global Conflict Map

The centerpiece — a full interactive **MapLibre GL JS** map with multiple data layers:

- **✈️ Military Aircraft** — Live positions from OpenSky Network, filtered by ICAO24 hex prefixes for 15+ NATO and allied nations. Color-coded by country with callsign tooltips.
- **🚢 Naval Vessels** — AIS vessel tracking via Digitraffic (Baltic/Nordic) and AISHub (global). Filterable by type, flag, speed, and heading.
- **💥 Conflict Events** — ACLED-sourced conflict events mapped to geolocations with event type classification (battles, explosions, protests, violence against civilians).
- **🔥 Fire Hotspots** — NASA FIRMS satellite fire detection (VIIRS SNPP). High-confidence thermal anomalies that may indicate military activity.
- **🛡️ Mil. Bases** — Combined DoD + OSM military installations worldwide, plus 26 strategic airbases with ICAO codes.
- **🌐 Cyber Events** — Geolocated cyber threat indicators from CVE + GDELT intelligence.
- **🚫 No-Fly Zones** — FAA NOTAM-derived restricted airspace overlays (requires LDGR API key).
- **📊 Heatmap Mode** — Density visualization of conflict event clustering.
- **📈 CAST Forecasts** — ACLED Conflict Alert System predictions overlaid on the map.
- **⚡ UCDP Events** — Uppsala Conflict Data Program armed conflict events.

Toggle any layer on/off via the layers panel. All data refreshes every **2 minutes**.

---

## 📈 Conflict Forecast

**ACLED CAST** (Conflict Alert System) 6-month predictions:

- Top 15 countries ranked by predicted conflict events
- Expandable detail per country: battles, explosions/remote violence, violence against civilians
- Sort toggle between total events and fatality risk
- User-configurable priority regions
- Data refreshes every **1 hour** via scrp-api SWR cache

---

## 🧠 Threat Assessment

AI-generated strategic threat briefing powered by your local **Ollama** instance (via the RMG Bridge Extension).

- Analyzes conflict events, CAST forecasts, cyber threats, CISA KEV, UCDP data, and news sentiment
- Identifies **hot zones** and assigns a global threat level (LOW / MODERATE / HIGH / CRITICAL)
- Incorporates vessel, aircraft, and NOTAM data when available
- Cached to Supabase; requires Ollama running locally

---

## ✈️ Aircraft Tracker

Live military aircraft positions from **OpenSky Network**.

- Filtered by ICAO24 hex prefixes for NATO+ nations (US, UK, France, Germany, etc.)
- Shows callsign, altitude, speed, heading, and origin country
- Click any aircraft on the map for detailed info
- Authenticated users (via LDGR OpenSky key) get **4,000 credits/day** vs ~100 anonymous

---

## 🚢 Vessel Tracker

Real-time vessel surveillance from **Digitraffic AIS** and **AISHub**.

- Filter by vessel type (Tanker, Cargo, Passenger, Fishing, etc.)
- Filter by flag state, speed, and navigation status
- Color-coded by vessel type on the map
- Click for MMSI, destination, callsign, and heading details

---

## 📰 Conflict Intel

Latest conflict-related news articles from **GDELT** via the scrp-api proxy.

- 30 articles from the last 24 hours
- Click any headline to open the built-in article reader with **AI translation** and **bias analysis**

---

## 🔒 Cyber Threats

Triple-source cyber intelligence:

- **CVE Feed** — Latest vulnerabilities from CIRCL with CVSS severity scores
- **CISA KEV** — Known Exploited Vulnerabilities catalog (actively exploited in the wild)
- **Cyber News** — GDELT articles filtered for ransomware, APT, breach, DDoS, exploit, and zero-day keywords

---

## 🛡️ Civilian Tracker

ACLED civilian impact data:

- Violence against civilians, protests, and riots
- Fatality counts and country breakdown bars
- Top perpetrators by event count
- Geographic distribution with trend indicators

---

## 🔥 Hotspot Detection

**NASA FIRMS** satellite thermal anomaly detection.

- VIIRS SNPP sensor data
- High-confidence filter to reduce false positives
- Supports LDGR FIRMS API key for enhanced access, falls back to open NRT data

---

## 📈 Defense Stocks

Real-time defense sector stock performance via **Yahoo Finance**:

`RTX` · `LMT` · `NOC` · `BA` · `GD` · `HII` · `LHX` · `LDOS`

---

## ☢️ Nuclear Threat Level

Static indicator based on the **Bulletin of the Atomic Scientists** Doomsday Clock, plus DEFCON level indicators.

---

## 🏗️ Map Layer Controls

Use the **Layers** button (top-left of the map) to toggle any combination of data layers. Your selections are **saved automatically** and persist across sessions.

---

## ⚙️ Data Sources

| Source | Auth | Refresh |
|--------|------|---------|
| OpenSky Network | LDGR key (or anon) | 1 min |
| Digitraffic AIS | Public | 2 min |
| ACLED Events (via scrp-api) | Server-side OAuth2 | 10 min |
| ACLED CAST Forecasts | Server-side | 1 hour |
| NASA FIRMS | LDGR key (or open) | 10 min |
| CIRCL CVE | Public | 10 min |
| CISA KEV | Public | 10 min |
| UCDP | Public | On demand |
| GDELT | Public | 10 min |
| Yahoo Finance | Proxy | 5 min |
| FAA NOTAMs | LDGR key | 30 min |

---

*Part of [N-SIT](https://github.com/54MUR-AI/inst) — Networked Strategic Intelligence Tool*
