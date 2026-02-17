# 🏛️ N-SIT — Politics

Global political intelligence with interactive governance mapping, election tracking, executive action monitoring, and prediction market integration.

---

## 🗺️ Global Political Map

Interactive **MapLibre GL JS** choropleth map with four view modes:

- **🎨 Ideology** — Countries colored by governing ideology (left, center-left, center, center-right, right, theocratic, military, communist). Leader portraits from Wikipedia.
- **📊 Governance** — World Bank Governance Indicators composite scores. Hover for detailed breakdown: Rule of Law, Corruption Control, Political Stability, Regulatory Quality, Government Effectiveness, Voice & Accountability.
- **💰 Military Spending** — Military expenditure as % of GDP from SIPRI data. Color gradient from low (green) to high (red).
- **🗳️ US States** — State-level political data with polling averages and electoral indicators.

Toggle view modes via the **Layers** panel (top-left). Your selected view **persists across sessions**.

---

## 🗳️ Elections Calendar

Upcoming and recent elections worldwide:

- Presidential, parliamentary, and referendum dates
- Country flags and election type indicators
- Countdown timers to upcoming votes
- Results for completed elections where available

---

## 📰 Political News

Live political news feed from **GDELT** via scrp-api:

- Filtered for governance, diplomacy, elections, and policy keywords
- Click any headline to open the built-in article reader
- AI-powered translation and bias analysis available

---

## 🔮 Prediction Markets

Political prediction markets from **Polymarket** (Gamma API):

- Live odds on elections, policy decisions, and geopolitical events
- Volume and liquidity indicators
- Real-time probability updates

---

## 📜 Executive Actions

Tracker for executive orders, memoranda, and proclamations:

- Chronological feed of recent executive actions
- Category classification (economy, defense, immigration, environment, etc.)
- Impact assessment indicators

---

## 🚫 Sanctions & Trade

International sanctions and trade policy tracker:

- Active sanctions programs by country/entity
- Recent sanctions actions and modifications
- Trade agreement updates and tariff changes

---

## 📈 Governance Index

Comprehensive governance rankings for 190+ countries:

- **Composite Score** — Weighted average of 6 World Bank indicators
- **Rule of Law** — Contract enforcement, property rights, courts
- **Corruption Control** — Public/private corruption perception
- **Political Stability** — Likelihood of political instability or violence
- **Regulatory Quality** — Ability to formulate sound policies
- **Government Structure** — Institutional framework assessment
- **Civil Liberties** — Freedom of expression, association, and media

Sortable table with search. Your sort preferences **persist across sessions**.

---

## ⚙️ Data Sources

| Source | Auth | Refresh |
|--------|------|---------|
| World Bank Governance | Public | Static + live refresh |
| SIPRI Military Spending | Public | Static dataset |
| Wikipedia (leaders) | Public | On demand |
| Wikidata SPARQL | Public | On demand |
| GDELT | Public | 10 min |
| Polymarket | Public | 5 min |

---

*Part of [N-SIT](https://github.com/54MUR-AI/inst) — Networked Strategic Intelligence Tool*
