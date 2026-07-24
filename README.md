# 🏏 Cricket World Cup Knockout Simulator

A modern, responsive **single-page Cricket World Cup Knockout Simulator** built with React 18, TypeScript, Tailwind CSS, and Framer Motion. The application automatically fetches all country records (~254 records) from the **REST Countries v5 API** using Bearer token authentication, filters sovereign nations, and simulates T20 cricket knockout tournaments round-by-round with instant simultaneous match score generation, Super Overs, Orange Cap (Top Batter), and Purple Cap (Top Bowler) awards.

---

## 🌟 Key Features

- **REST Countries v5 API Integration**: Automatically fetches ~254 country records using paginated endpoints and Bearer token authentication.
- **Sovereign Country Filter**: Filters countries to identify sovereign nations for Cricket World Cup eligibility.
- **Full 256-Team Mega Tournament**: All 256 teams play in Round 1 (128 simultaneous T20 cricket matches in the Round of 256) with **zero byes**.
- **T20 Cricket Score Simulation & Super Overs**: Generates realistic cricket scores (Runs, Wickets, Overs). Tied matches automatically trigger a **Super Over** tie-breaker (`165/7 vs 165/8 [Super Over: IND 18/0 vs PAK 12/1]`).
- **Cricket Awards & Live Stats**:
  - 🏏 **Orange Cap (Top Batter)**: Real-time tracking of top run scorer across all rounds.
  - ⚾ **Purple Cap (Top Bowler)**: Real-time tracking of top wicket taker across all rounds.
  - 📊 **Match Performers**: Displays top batter (`78 runs (48b)`) and top bowler (`3/24`) on each match card.
- **Nations Directory Drawer**: Search and filter all ~254 fetched country records by sovereign/dependency status, region, name, or ISO/ICC codes.
- **Champion Celebration Modal**: Triggers `canvas-confetti` explosion with golden trophy presentation, Orange Cap, and Purple Cap awards.

---

## 🔑 How to Put and Configure the API Key

### 1. How to Find & Get a REST Countries v5 API Key
1. Visit the official REST Countries Dashboard at [https://restcountries.com/dashboard](https://restcountries.com/dashboard) or [https://restcountries.com/api-keys](https://restcountries.com/api-keys).
2. Register for a free account to generate your Bearer API token (e.g. `rc_live_3ddccde8406b46e2b0edc5858d9c6033`).

### 2. How to Add Your API Key to the Application
Create a `.env` file in the project root folder (you can copy `.env.example`):

```bash
cp .env.example .env
```

Open `.env` and paste your Bearer token:

```env
# REST Countries v5 API Configuration
VITE_REST_COUNTRIES_BEARER_TOKEN=rc_live_your_actual_bearer_token_here
```

---

## 🔍 How the Application Finds and Uses the API Key

The application dynamically detects and applies your API key through the following flow:

1. **Environment Key Detection** ([src/services/restCountriesApi.ts](file:///e:/allcricket/src/services/restCountriesApi.ts)):
   - The application inspects Vite's environment variable `import.meta.env.VITE_REST_COUNTRIES_BEARER_TOKEN`.
   - If present, it automatically formats the `Authorization: Bearer <TOKEN>` HTTP header.
   - If not set, it gracefully falls back to the offline dataset.

2. **CORS Bypassing via Vite Server Proxy** ([vite.config.ts](file:///e:/allcricket/vite.config.ts)):
   - Browser client requests to external APIs can trigger CORS origin restrictions (`originNotAllowed`).
   - The application routes API requests through Vite's built-in development proxy (`/api-restcountries`), which forwards requests server-to-server to `https://api.restcountries.com/countries/v5`.
   - This ensures 100% reliable fetching without CORS errors.

3. **Offline Resilient Fallback**:
   - If the API service is unreachable or rate-limited, the application seamlessly loads a complete offline dataset (~210 sovereign nations) so the simulator never crashes.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Installation & Execution

1. Navigate to the project directory:
   ```bash
   cd e:\allcricket
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3001` (or the URL printed in the terminal).

### Building for Production

```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion & Canvas Confetti
- **Icons**: Lucide React
- **State Management**: Zustand
- **API**: REST Countries v5 API (`https://api.restcountries.com/countries/v5`)
