# 🚍 SmartTransit (SIH25013)
> **Real-Time Public Transport Tracking for Small Cities**
> Powered by **Solarch BaaS** · **React + Vite** · **Tailwind CSS** · **Leaflet & OpenStreetMap**

---

## 📌 Overview

**SmartTransit** is a lightweight, real-time public transport tracking web application designed specifically for small and medium-sized cities. It solves the challenge of unpredictable bus schedules by connecting passengers, bus drivers, and city transport administrators inside a single, role-based application.

- **Passengers** can discover routes, check stop sequences, and track buses live on an interactive map with dynamic ETA calculations.
- **Drivers** can start assigned trips with a single click, streaming live GPS coordinates directly from their browser or smartphone.
- **Administrators** monitor fleet health, manage bus and route inventory, and view all active buses on a live fleet map.

---

## 🛠 Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite |
| **Styling & UI** | Tailwind CSS v4 (Glassmorphism design system) |
| **Maps & Routing** | Leaflet + React-Leaflet + OpenStreetMap |
| **Backend as a Service** | [Solarch](https://solarch.in) (SQLite + Express + Realtime WebSockets/SSE) |
| **Browser APIs** | HTML5 Geolocation API, LocalStorage, PWA Service Worker |
| **State & Auth** | Context API + Solarch Authentication & JWT Store |

---

## 🏗 System Architecture

```text
                          ONE WEB APP
                    React + Vite + Tailwind
                              │
             ┌────────────────┼────────────────┐
             ▼                ▼                ▼
        PASSENGER          DRIVER            ADMIN
          MODE              MODE              MODE
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                       SOLARCH BACKEND
              Authentication · SQLite Database
              Realtime SSE · Access Rules
                              │
                              ▼
                      Application Data
```

---

## 📊 Data Model & Collections

The application uses 6 core entities in the Solarch backend:

1. **`users`** — `id, name, email, phone, role` (`PASSENGER`, `DRIVER`, `ADMIN`)
2. **`routes`** — `id, route_name, start_location, end_location, status`
3. **`stops`** — `id, route_id, stop_name, latitude, longitude, stop_order`
4. **`buses`** — `id, bus_number, registration_number, driver_id, route_id, status`
5. **`trips`** — `id, bus_id, driver_id, route_id, start_time, end_time, status`
6. **`live_locations`** — `id, bus_id, trip_id, latitude, longitude, speed, timestamp`

---

## ✨ Features by Role

### 👤 Passenger Mode (`/passenger`)
- Search buses by number, route, or location.
- Detailed route timelines showing ordered stop sequences.
- Interactive live tracking map with bus position markers and custom stop icons.
- Real-time ETA calculations based on Haversine distance and current bus speed.

### 🚌 Driver Mode (`/driver`)
- Simple dashboard displaying assigned bus (`BUS-101`) and route (`IPS Academy → Rajwada`).
- **One-click START TRIP**: Requests GPS permission only when the trip starts.
- Automatic location streaming to Solarch every 5 seconds.
- Speed, position, and update counters with an **END TRIP** workflow.

### ⚙️ Admin Mode (`/admin`)
- Real-time fleet metrics (Total, Active, Running, Offline buses).
- Fleet management tables for buses and route stop sequences.
- **Live Fleet Map**: Monitors all active buses across the city simultaneously.

---

## 🔑 Demo Login Credentials

You can test all three roles out of the box using these credentials:

| Role | Email | Password | Access |
|---|---|---|---|
| **Passenger** | `passenger@transit.dev` | `123456` | Public bus search, live tracking map, ETAs |
| **Driver** | `driver@transit.dev` | `123456` | Driver dashboard, START/END trip, GPS broadcast |
| **Admin** | `admin@transit.dev` | `123456` | Fleet dashboard, bus/route management, Live map |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/ommishra2008a-tech/transit.git
cd transit
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SOLARCH_URL=http://127.0.0.1:8090
SOLARCH_JWT_SECRET=smart-transit-super-secret-jwt-key-2026-sih25013
```

### 3. Start Solarch Backend Server
```bash
npm run backend
```
> Solarch server runs at `http://127.0.0.1:8090` (Admin UI at `http://127.0.0.1:8090/_/`).

### 4. Seed Initial Data (Optional)
In a separate terminal, seed demo users, routes, and buses:
```bash
node backend/seed.js
```

### 5. Start Frontend Dev Server
```bash
npm run dev
```
Open `http://localhost:5173/` in your browser.

---

## 📁 Project Structure

```text
transit/
├── backend/
│   ├── server.js          # Solarch BaaS server instance & auto-schema bootstrapper
│   └── seed.js            # Initial dataset seeder (users, routes, stops, buses)
├── src/
│   ├── app/
│   │   ├── App.jsx        # Root application layout
│   │   └── router.jsx     # Role-based protected router
│   ├── components/
│   │   ├── BusCard/       # Bus info card
│   │   ├── Map/           # Leaflet map container & custom bus/stop markers
│   │   ├── Navbar/        # Desktop & mobile responsive nav
│   │   ├── RouteCard/     # Route display card
│   │   ├── StatusBadge/   # Status badges (RUNNING, ACTIVE, OFFLINE)
│   │   └── StopList/      # Ordered route timeline component
│   ├── hooks/
│   │   ├── useAuth.jsx    # Auth context & session manager
│   │   ├── useGeolocation # Browser Geolocation API hook
│   │   └── useRealtime    # Solarch SSE Realtime subscription hook
│   ├── lib/
│   │   └── solarch.js     # Custom Solarch REST & Realtime Client SDK
│   ├── pages/
│   │   ├── admin/         # Admin dashboard, buses, routes, live fleet map
│   │   ├── auth/          # Login page with demo shortcuts
│   │   ├── driver/        # Driver dashboard & active trip tracking
│   │   └── passenger/     # Passenger home, bus details, live tracking map
│   ├── services/          # Solarch service API calls (auth, bus, route, trip, location)
│   ├── utils/             # Haversine distance, ETA, next stop algorithms
│   └── index.css          # Design system stylesheet
├── package.json
└── README.md
```

---

## 🎯 SIH 25013 Guardrails Adherence

- ✅ **Single Application**: No separate apps required for driver/passenger/admin.
- ✅ **Solarch Backend**: Single source of truth powered by Solarch.
- ✅ **No Unnecessary AI/ML**: Clean, lightweight Haversine + speed ETA formula.
- ✅ **Real-Time Core**: Browser GPS → Solarch SSE → Reactive Leaflet map markers.

---

## 📜 License

MIT License — Developed for **Smart Transit (SIH25013)**.
