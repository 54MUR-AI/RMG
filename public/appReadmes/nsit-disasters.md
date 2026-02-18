# 🌋 N-SIT — Disasters

Real-time natural disaster monitoring with earthquake tracking, storm surveillance, volcanic activity alerts, space weather data, satellite fire detection, and AI-powered disaster forecasting.

---

## 🗺️ Disaster Map

Interactive **MapLibre GL JS** map with multiple hazard layers:

- **🔴 Earthquakes** — USGS real-time seismic data. Circle size = magnitude, color = depth. Click for detailed info including tsunami warnings and felt reports.
- **🌀 Storms & Hurricanes** — GDACS tropical cyclone alerts with track projections and severity categories.
- **🌋 Volcanoes** — Active volcanic alerts from GDACS with eruption status and ash advisory zones.
- **🌊 Tsunamis** — GDACS tsunami alerts with wave height estimates and affected coastlines.
- **🔥 Wildfires** — NASA FIRMS satellite thermal anomalies (VIIRS SNPP). High-confidence fire detections globally.

Toggle layers via the map controls. All data refreshes every **5 minutes**.

---

## 🧠 AI Disaster Forecast

AI-generated disaster risk assessment powered by your local **Ollama** instance (via the RMG Bridge Extension):

- Synthesizes earthquakes, GDACS alerts, NASA FIRMS hotspots, solar data, WHO disease outbreaks, ReliefWeb disasters, NWS weather alerts, and disaster news
- Generates a structured forecast with risk levels and regional hotspots
- Identifies emerging threats and cascading risk scenarios
- Requires Ollama running locally with a model selected in Settings

---

## ⚠️ Disaster Threat Level

Global disaster threat level based on:

- Active earthquake swarms and significant seismic events
- Tropical cyclone activity and projected impacts
- Volcanic eruption alerts and ash advisories
- Wildfire severity and spread patterns
- Solar storm activity and geomagnetic indices
- WHO disease outbreak alerts
- NWS severe weather warnings

---

## 📊 Earthquake Tracker

Live seismic data from the **USGS Earthquake API**:

- All M2.5+ earthquakes from the last 7 days
- Sortable by magnitude, time, depth, and location
- Tsunami warning indicators
- Felt report counts (DYFI — Did You Feel It?)
- Alert level classification: Green → Yellow → Orange → Red
- Click any event for the full USGS detail page

---

## 🌀 Storm & Hurricane Tracker

Tropical cyclone monitoring from **GDACS** (Global Disaster Alert and Coordination System):

- Active storms with category, wind speed, and pressure
- Projected track and cone of uncertainty
- Affected population estimates
- Alert severity: Green → Orange → Red

---

## 🌋 Volcano & Tsunami Alerts

Combined volcanic and tsunami monitoring from **GDACS**:

- Active volcanic eruptions with VEI (Volcanic Explosivity Index)
- Ash advisory zones and aviation color codes
- Tsunami alerts with estimated wave heights
- Historical context for recurring events

---

## ☀️ Space Weather

Solar activity monitoring from **NOAA SWPC**:

- **Solar Flare Activity** — X-ray flux classification (A, B, C, M, X)
- **Geomagnetic Storm Index** — Kp index and G-scale storm level
- **Solar Wind** — Speed, density, and magnetic field orientation
- **Radio Blackout Risk** — HF radio propagation impact assessment

---

## 🔥 Wildfire Detection

**NASA FIRMS** satellite fire detection (shared with Conflicts tab):

- VIIRS SNPP sensor thermal anomalies
- High-confidence filter to reduce false positives
- Global coverage updated multiple times daily
- Supports LDGR FIRMS API key for enhanced access

---

## 📰 Disaster News

Live disaster-related news from **GDELT** via scrp-api:

- Filtered for earthquake, hurricane, flood, wildfire, volcano, and tsunami keywords
- Click any headline for the full article with AI translation

---

## 🆘 ReliefWeb

Latest disaster declarations and humanitarian updates from **UN OCHA ReliefWeb**:

- Active disaster declarations worldwide
- Disaster type, affected countries, and GLIDE numbers
- Status tracking (ongoing, past, alert)

---

## 🦠 WHO Disease Outbreaks

Disease outbreak notifications from the **WHO Disease Outbreak News** (DON) feed:

- Active outbreaks with disease name, affected countries, and dates
- Severity classification and response status
- Fed into the AI Disaster Forecast for pandemic risk assessment

---

## 🌩️ Weather Alerts

Severe weather alerts from the **National Weather Service** (NWS):

- Active warnings, watches, and advisories across the US
- Severity and certainty classifications
- Fed into the AI Disaster Forecast for weather risk assessment

---

## ⚙️ Data Sources

| Source | Auth | Refresh |
|--------|------|---------|
| USGS Earthquake API | Public | 5 min |
| GDACS Alerts | Public | 5 min |
| NOAA SWPC | Public | 5 min |
| NASA FIRMS | LDGR key (or open) | 10 min |
| ReliefWeb | Public | 15 min |
| WHO DON | Public | 30 min |
| NWS Alerts | Public | 10 min |
| GDELT | Public | 10 min |
| Ollama | Local (RMG Bridge) | On demand |

---

*Part of [N-SIT](https://github.com/54MUR-AI/inst) — Networked Strategic Intelligence Tool*
