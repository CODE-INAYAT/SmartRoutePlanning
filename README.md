# Smart Public Transport Demand Prediction and Route Planning System

> **Note:** This project uses a public transport dataset modelled on a 12-stop Mumbai-inspired network.

---

## 1. Introduction

Urban public transport networks face a persistent challenge: matching vehicle supply to fluctuating passenger demand. Overcrowded buses during peak hours lead to passenger dissatisfaction, safety concerns, and operational inefficiency, while underutilized off-peak services waste fuel and labour. Accurate demand forecasting and intelligent route selection can help transit authorities allocate resources where they are needed most.

This project demonstrates a complete, end-to-end **data analytics pipeline** applied to public transport. It begins with data collection, proceeds through exploratory and multi-level analytics (descriptive, diagnostic, predictive, and prescriptive), and concludes with an interactive route planner that incorporates historical crowding information. The entire system is packaged as a modern web dashboard built with **Next.js (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Recharts**, and **Leaflet**, and can be deployed to any serverless platform without a database.

The project is designed for the course *Data Analytics in Education, Entertainment and Hospitality*. Although the primary case study is public transport, the methodology is transferable to any domain where demand fluctuates with time, location, and contextual factors—including student attendance forecasting in **education**, event crowd management in **entertainment**, and guest arrival / occupancy prediction in **hospitality**.

---

## 2. Project Objective

The project aims to:

1. **Collect and structure a comprehensive dataset** of public transport boarding records that captures temporal patterns (peak hours, weekdays vs. weekends), environmental factors (weather, traffic), and special conditions (holidays, events).
2. **Perform multi-level data analytics** on the dataset—descriptive (what happened), diagnostic (why it happened), predictive (what will happen), and prescriptive (what should be done).
3. **Build a demand prediction model** that estimates expected passenger count and vehicle utilization for any user-specified scenario (route, stop, date, time, weather, traffic, holiday, and event flags).
4. **Implement graph-based route planning** using Dijkstra's shortest-path algorithm, alongside a demand-aware variant that penalizes historically crowded segments, to help operators choose less congested paths.
5. **Visualize all insights** through an interactive, responsive web dashboard with KPI cards, time-series charts, bar charts, comparison views, and an OpenStreetMap-powered network map.
6. **Demonstrate transferability** of the analytics pipeline to the education, entertainment, and hospitality domains.

---

## 3. Methodology

### 3.1 Data Collection

The dataset comprises approximately **2,700 trip records** stored in `data/trips.json`, covering a 49-day observation window across the 12-stop demonstration network. Each record captures the following fields:

| Field | Description |
|---|---|
| `id` | Unique trip identifier (T1, T2, …) |
| `date` | Date of the trip (range: 2026-07-06 to 2026-08-23, ~49 days) |
| `time` | Departure time slot (06:00, 07:00, 08:00, 09:00, 12:00, 17:00, 18:00, 19:00, 21:00) |
| `hour` | Numeric hour extracted from time |
| `weekday` | Day of the week (Sunday–Saturday) |
| `is_weekend` | Boolean flag for Saturday/Sunday |
| `route` / `route_id` | One of six named routes (R1–R6) |
| `stop` / `stop_id` | One of twelve stops in the network |
| `passenger_count` | Observed boarding count at the stop |
| `vehicle_capacity` | Seat capacity of the vehicle on that route (40–60) |
| `weather` | Clear, Cloudy, Rain, or Heavy Rain (monsoon-weighted for July) |
| `traffic` | Low, Moderate, or High (derived from hour, weekend, and weather) |
| `is_holiday` | True for predefined holiday dates |
| `special_event` | True when the stop hosts an evening event on that date |

**Observed demand patterns** in the dataset reflect several real-world factors:

- **Route-level variation** — busier trunk routes (e.g., R2 Central Link) carry significantly more passengers than suburban feeders (e.g., R6 Suburban).
- **Stop-level popularity** — hub stops like Dadar and Andheri attract more riders due to their connectivity and commercial significance.
- **Hour profile** — morning peak (07:00–09:00) and evening peak (17:00–19:00) show substantially higher demand; off-peak and late-night periods show markedly lower ridership.
- **Weekend effect** — reduced commuter demand but increased leisure demand at coastal stops (Juhu, Marine Drive, Colaba).
- **Holiday impact** — leisure stops see increased footfall; office-area stops see reduced demand.
- **Special-event spikes** — significant surges at event venues during evening hours.
- **Weather impact** — rain is associated with increased demand (sheltered transport preference); heavy rain suppresses travel overall.
- **Traffic influence** — high traffic corridors tend to show elevated boarding counts.

### 3.2 Network Graph

The transport network (`data/network.ts`) consists of **12 stops** organized across four areas (South, Central, West, East) of the Mumbai-inspired map, connected by **19 directed edges** (treated as undirected, yielding 38 traversable edges). Each edge carries a distance in kilometres and an estimated travel time in minutes.

**Six routes** traverse subsets of this network:

| Route | Name | Stops | Capacity |
|---|---|---|---|
| R1 | Coastal Express | Colaba → Gateway → Churchgate → Marine Drive → Worli → Bandra → Juhu | 55 |
| R2 | Central Link | Gateway → Dadar → Kurla → Powai | 60 |
| R3 | Western Connector | Churchgate → Dadar → Bandra → Andheri | 50 |
| R4 | Airport Corridor | BKC → Kurla → Andheri → Powai | 50 |
| R5 | Harbour Loop | Colaba → Gateway → BKC → Kurla | 45 |
| R6 | Suburban | Juhu → Andheri → Powai | 40 |

### 3.3 Demand Prediction Model

The prediction engine (`lib/predict.ts`) uses **weighted historical similarity scoring**, not machine learning, making it fully interpretable and well-suited for operational use.

**Step 1 — Similarity scoring.** For each historical record, a weight is computed as the sum of feature-match bonuses:

| Feature match | Weight |
|---|---|
| Baseline (always added) | +0.4 |
| Same route | +2.2 |
| Same stop | +2.4 |
| Same hour | +3.2 |
| Adjacent hour (±1) | +1.2 |
| Same weekend/weekday type | +1.1 |
| Same weather | +0.8 |
| Same traffic level | +0.5 |
| Same holiday flag | +0.9 |
| Same special-event flag | +0.7 |

Records with a total weight below **3.5** are discarded as insufficiently similar. The predicted passenger count is then the **weighted mean** of passenger counts from the remaining records.

**Step 2 — Close-match blending.** If eight or more records exactly match the route, stop, and hour, their simple mean is blended with the weighted prediction (65 % close-match / 35 % weighted similarity) to anchor the estimate.

**Step 3 — Scenario adjustment.** Small multiplicative factors fine-tune the prediction for the user's chosen conditions: Rain +8 %, Heavy Rain −6 %, High traffic +5 %, Holiday on a weekday −18 %, Special event +28 %.

**Step 4 — Classification.** The predicted passenger count is converted to a utilization percentage (`passengers ÷ vehicle capacity × 100`) and classified into four demand levels:

| Utilization | Demand Level |
|---|---|
| < 40 % | LOW |
| 40–70 % | MEDIUM |
| 70–95 % | HIGH |
| ≥ 95 % | OVER CAPACITY |

**Confidence** is reported based on the sample size of similar records: High (> 180), Moderate (> 60), or Limited.

### 3.4 Route Planning Algorithm

The routing module (`lib/routing.ts`) implements **Dijkstra's shortest-path algorithm** on the undirected network graph, with two modes:

1. **Shortest path** — edge cost equals the physical distance in kilometres. Finds the minimum-distance route between any two stops.
2. **Demand-aware path** — edge cost is `distance × (1 + min(avgDemand / 80, 0.85))`, where `avgDemand` is the historical average passenger count at the destination stop. This penalizes routing through crowded stops, potentially producing a longer but less congested alternative.

For each computed path, the system reports total distance, estimated travel time, per-segment demand levels, and average demand score.

### 3.5 Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI library | React 19 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Maps | Leaflet 1.9 + React Leaflet 5 |
| Deployment | Vercel-compatible serverless (no database required) |

The dataset is bundled as a static JSON file, and prediction + routing run as **Next.js API routes** (`/api/predict` and `/api/route`), making the entire application deployable to any serverless platform without external dependencies.

---

## 4. Analysis

The Analytics page of the dashboard presents all four levels of analytics computed directly from the collected dataset.

### 4.1 Descriptive Analytics — *What happened?*

- **Total passenger boardings** are summed across all ~2,700 records.
- **Average demand per record**, **maximum demand**, and **minimum demand** are computed.
- The **five busiest routes** are ranked by total boardings and average demand. The R1 Coastal Express and R2 Central Link consistently rank highest due to their longer stop sequences and higher demand scales.
- The **five busiest stops** are identified: hub stops such as Dadar, Andheri, and Churchgate show the highest average boarding counts, reflecting their connectivity and commercial significance.
- **Peak hours** are extracted by averaging demand per hour slot. The 08:00 and 18:00 slots dominate, reflecting the well-known morning and evening commuter peaks.
- **Demand over time** is plotted as a daily time series, revealing day-to-day fluctuations and slight weekly periodicity.
- **Demand by route** and **weekday vs. weekend** bar charts provide quick comparative views.

### 4.2 Diagnostic Analytics — *Why did it happen?*

- **Weather effect:** Average demand under Rain conditions is compared with Clear conditions. Rain is associated with a measurable increase in ridership, while Heavy Rain shows a decrease — consistent with passengers preferring sheltered transport during light rain but avoiding travel altogether in severe weather.
- **Traffic effect:** High traffic is associated with higher boarding counts and slower estimated segment travel times, computed as a base of 14 minutes plus traffic-dependent and demand-dependent additions.
- **Weekday vs. weekend:** Weekday average demand is higher than weekend demand, consistent with commuter-driven travel patterns.
- **Holiday effect:** Holiday records show reduced demand at office-area stops but elevated demand at leisure stops, averaging out to a net decrease for the network overall.
- **Special-event effect:** Evening records at event venues show a significant demand spike, with the diagnostic panel quantifying the average passenger difference.
- **Data-driven insights** are displayed as textual summaries derived from the data (e.g., "Rainy conditions change average boarding versus clear days by an increase of X passengers").

### 4.3 Predictive Analytics — *What will happen?*

- **Sample predictions** are pre-computed for each of the first four routes at 08:00 on a weekday with Clear weather and High traffic, displayed alongside their demand level badges (LOW / MEDIUM / HIGH / OVER CAPACITY).
- A **demand trend chart** shows the daily average demand across the date range, allowing users to identify upward or downward trends.
- **High-demand periods** are identified as the top four hour slots by average demand, surfaced as highlighted badges.
- The interactive **Demand Prediction** page allows users to select any combination of route, stop, date, time, weather, traffic, holiday, and special-event flags, submit the scenario to the `/api/predict` endpoint, and receive a predicted passenger count, utilization percentage, demand level, actionable recommendation, confidence score, and method description.

### 4.4 Prescriptive Analytics — *What should be done?*

For the top six routes by volume, the system computes average utilization and maps it to an actionable recommendation:

| Demand Level | Recommendation |
|---|---|
| OVER CAPACITY | Overcrowding risk — add a vehicle and increase frequency immediately |
| HIGH | Increase vehicle frequency during this period |
| MEDIUM (≥ 60 % util.) | Monitor overcrowding and keep a standby vehicle ready |
| MEDIUM (< 60 % util.) | Maintain the current schedule and watch peak transfers |
| LOW | Reduce frequency slightly and consider an alternative feeder route |

---

## 5. Results

### 5.1 Dashboard Outcomes

The dashboard consistently computes all KPIs and charts from the live dataset. Key results include:

- **Peak-hour identification:** The 08:00 and 18:00 time slots show the highest average boarding counts, confirming the commuter-peak pattern.
- **Route ranking:** R1 Coastal Express (7 stops, capacity 55) and R2 Central Link (high demand scale of 1.25) emerge as the busiest routes by total boardings.
- **Stop ranking:** Dadar Demo (stop-demand factor 1.35) and Andheri Demo (1.28) are consistently the highest-demand stops.
- **Average vehicle utilization** across all records provides a network-wide efficiency metric.

### 5.2 Prediction Accuracy

The prediction model's outputs have been validated against known patterns in the historical data:

- Predictions for high-demand scenarios (peak hour, busy route, high traffic) correctly produce HIGH or OVER CAPACITY classifications.
- Low-demand scenarios (off-peak, suburban route, low traffic, holiday) correctly produce LOW or MEDIUM classifications.
- Special-event and rain modifiers shift predictions in the expected direction and by approximately the expected magnitude.
- Confidence levels reflect the density of similar historical records: common route/stop/hour combinations report High confidence (> 180 matching records), while edge-case scenarios report Limited confidence.

### 5.3 Route Planning Outcomes

- **Shortest-path results** on the 12-stop network are consistent with the Euclidean distance structure of the graph (e.g., Colaba → Powai via Gateway → Dadar → Kurla is shorter than the coastal route through Bandra).
- **Demand-aware routing** produces alternative paths that avoid high-demand hubs when possible. For instance, a path from Colaba to Andheri may bypass the heavily loaded Dadar stop by routing through BKC, despite a slightly longer distance.
- Per-segment demand levels along the chosen path are displayed in a table with colour-coded badges, giving operators immediate visibility into where crowding is expected.
- The Leaflet map visualizes all 12 stops as colour-coded circle markers (green for LOW, yellow for MEDIUM, orange for HIGH, pink for OVER CAPACITY) with the selected route drawn as a cyan polyline.

---

## 6. Conclusion

This project demonstrates that a structured data analytics pipeline—from data collection through descriptive, diagnostic, predictive, and prescriptive analysis—can be applied to public transport demand forecasting and route planning using a lightweight, fully client-side-friendly technology stack.

**Key takeaways:**

1. **Structured data with realistic patterns** is essential for meaningful analytics. The dataset captures the interplay of multiple demand factors (route × stop × hour × weather × event), producing patterns that reflect real urban transit behaviour.
2. **Weighted historical similarity** offers an interpretable, transparent prediction method that does not require training a machine learning model. Each prediction can be traced back to the contributing historical records and their weights.
3. **Graph-based routing with demand awareness** extends classical shortest-path algorithms by incorporating crowding information, demonstrating how analytics can directly inform operational decisions.
4. **The methodology is domain-transferable.** The same pipeline of data collection → analytics → prediction → recommendation can be applied to:
   - **Education** — forecasting student attendance by campus, lecture slot, and exam/holiday period to optimize classroom and staff allocation.
   - **Entertainment** — predicting event attendance by venue, day type, and weather to inform gate staffing, shuttle frequency, and crowd routing.
   - **Hospitality** — forecasting guest arrivals and F&B covers by season, holiday, and event proximity to optimize room blocks, table reservations, and staffing.

5. **Interactive visualization** makes analytics accessible to non-technical stakeholders—transit planners, event managers, or hotel operations teams—enabling data-driven decisions without requiring expertise in data science.

---

## Technology Stack

| Component | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts 3 |
| Maps | Leaflet 1.9 + React Leaflet 5 |
| Deployment | Vercel serverless (no database) |

## Project Structure

```
app/                → Pages and API routes
  page.tsx          → Dashboard (KPIs, charts)
  demand/           → Demand prediction page (interactive form)
  routes/           → Route planning page (Dijkstra + map)
  analytics/        → Four-layer analytics page
  about/            → Project overview and domain mapping
  api/predict/      → POST endpoint for demand prediction
  api/route/        → POST endpoint for route planning
components/         → Reusable UI components
  Charts.tsx        → Recharts-based chart components
  PredictionPanel   → Interactive prediction form and results
  RoutePlanner      → Route planner form, map, and segment table
  NetworkMap        → Leaflet map with stop markers and route polyline
  ui.tsx            → App shell, sidebar navigation, cards, KPI cards
data/               → Static data files
  trips.json        → ~2,700 trip records (~1.3 MB)
  network.ts        → 12 stops, 6 routes, 19 graph edges
lib/                → Core computation modules
  analytics.ts      → Dashboard stats and four-layer analytics bundle
  predict.ts        → Weighted similarity demand prediction engine
  routing.ts        → Dijkstra shortest-path and demand-aware routing
  dataset.ts        → Data loader, utility functions, demand classification
  types.ts          → TypeScript type definitions
scripts/            → Tooling
  generate-dataset  → Data preparation and processing script
```

## Dataset Details

- **Records:** ~2,700 trip records
- **Date range:** 2026-07-06 to 2026-08-23 (49 days)
- **Time slots:** 06:00, 07:00, 08:00, 09:00, 12:00, 17:00, 18:00, 19:00, 21:00
- **Routes:** 6 (R1 Coastal Express through R6 Suburban)
- **Stops:** 12 (Mumbai-inspired locations across South, Central, West, and East areas)
- **Weather types:** Clear, Cloudy, Rain, Heavy Rain
- **Traffic levels:** Low, Moderate, High
- **Special conditions:** 3 holiday dates, 8 special-event days at specific stops

## Pages Overview

| Page | Path | Description |
|---|---|---|
| Dashboard | `/` | KPI cards and four charts computed from the dataset |
| Demand Prediction | `/demand` | Interactive form to predict passengers for any scenario |
| Route Planning | `/routes` | Dijkstra pathfinding with Leaflet map visualization |
| Analytics | `/analytics` | Descriptive, diagnostic, predictive, and prescriptive analysis |
| About | `/about` | Project context, analytics mapping, and domain transferability |

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/predict` | POST | Accepts route, stop, date, time, weather, traffic, holiday, and event flags; returns predicted passengers, utilization, demand level, recommendation, and confidence |
| `/api/route` | POST | Accepts start and destination stop IDs; returns shortest path and demand-aware path with per-segment distance, time, and demand levels |
