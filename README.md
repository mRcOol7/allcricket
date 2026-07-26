# 🏏 All Cricket World Cup & 2D Stadium Live Match Simulator

A state-of-the-art, feature-rich **Cricket World Cup Tournament Simulator & 2D Stadium Live Match Engine** built with React 18, TypeScript, Tailwind CSS, and Framer Motion. The application integrates dynamic squad API services (`/api/squads`), REST Countries v5 API, 2D stadium pitch physics, browser Web Speech audio commentary, TV Broadcast DRS (Decision Review System), interactive Super Overs, and full match scorecards.

---

## 🌟 Key Features

### 🌐 1. Live Squads API Service (`GET /api/squads`) & REST Countries
- **20-Team International Squad Dataset**: Serves official squad rosters over HTTP (`/api/squads`) for **India, Australia, South Africa, Pakistan, England, New Zealand, West Indies, Afghanistan, Sri Lanka, USA, Namibia, Zimbabwe, Oman, Nepal, Ireland, Netherlands, Italy, Canada, Scotland, UAE**.
- **REST Countries v5 Integration**: Fetches ~254 country records using Vite server proxying (`/api-restcountries`) and Bearer token authentication with resilient offline dataset fallbacks.

### 🏟️ 2. 2D Stadium Live Match Physics & Real-Time Pitch Simulator
- **Interactive 2D Pitch Stadium**: Visualizes the 22-yard pitch strip, bowler run-up animations, batter stroke contact, ball trajectories, and 8 outfield fielders sliding towards boundary shots.
- **TV Scoreboard Ticker**: Displays live runs, wickets, over-by-over ball timeline, run rates, and target projections.

### 📺 3. TV Broadcast DRS (Decision Review System) & 3D Hawkeye Replay
- **UltraEdge Snickometer Replay**: Animated audio waveform graph detecting bat edge spikes (*"ULTRAEDGE SPIKE DETECTED!"* vs *"FLAT LINE ON ULTRAEDGE"*).
- **3D Hawkeye Ball Tracking Stumps Path**: Simulates ball trajectory showing **Pitching Line**, **Impact Point**, and **Wickets Hitting / Missing**.
- **Automatic Live Scenario Trigger**: Triggers 100% automatically during live ball-by-ball match play on close LBW and Catch appeals.
- **Third Umpire Voice Announcement**: Audio + visual decision reveal (`OUT 🔴` / `NOT OUT 🟢`) that upholds or overturns on-field decisions.

### 🎙️ 4. International TV Voice Commentary Engine (Ian Bishop & Ravi Shastri Style)
- **Authentic Broadcast Phrase Generator**: Generates iconic international commentary (*"REMEMBER THE NAME!", "INTO THE UPPER DECK!", "CLEAN BOWLED! TIMBERRR!"*).
- **Browser Web Speech Audio TTS**: Synthesizes and **voices live commentary out loud** as each ball is bowled.
- **Voice Control Toggle**: Includes a `Voice TTS: ON 🔊 / OFF 🔇` toggle directly on the live commentary feed.

### ⚡ 5. Interactive Super Over Sudden Death Mode (1 Over / 6 Balls)
- Tied 5-Over matches automatically transition into an interactive **Sudden Death Super Over** (Innings 3 & Innings 4).
- Features Super Over siren audio FX, live target chasing, and Super Over winner announcements.

### 📋 6. Full Official Match Scorecard
- Interactive **`Full Scorecard 📋`** panel featuring tabbed Batting Scorecard (*Out/Not Out status, Runs, Balls, 4s, 6s, Strike Rate*) and Bowling Figures (*Overs, Runs, Wickets, Economy*) for both Innings 1 and Innings 2.

### 🌤️ 7. Stadium Atmosphere Weather & Dugout Tactical Boosters
- **Weather Atmosphere Selector**: Switch between **Night Floodlights 🌃**, **Sunny Day ☀️**, and **Dew / Rain 🌧️**.
- **Dugout Tactical Cards**: Execute manager abilities like **Power Hit 🚀** (forces a monster 6) and **Searing Yorker 🎯** (forces a 152km/h wicket).
- **LED Boundary Rope Glow & Crowd Cheer Audio**: Boundary rope flashes **gold for 6s**, **emerald for 4s**, and **crimson for Wickets** accompanied by synth crowd cheer audio FX.

### 🏆 8. Knockout World Cup Tournament & Leaderboard Awards
- Full T20 Tournament Knockout Bracket with zero byes (Round of 256 / 128 / 64 / 32 / 16 / Quarter-Finals / Semi-Finals / Final).
- **Orange Cap (Top Batter)** & **Purple Cap (Top Bowler)** real-time leaderboard tracking.
- Gold Trophy Champion Celebration modal with confetti explosion.

---

## 🔑 Squads API & REST Countries Configuration

### 1. Local Squads API Endpoint (`GET /api/squads`)
The application includes a Vite dev server middleware in [vite.config.ts](file:///e:/allcricket/vite.config.ts) that serves squad data dynamically at:
```http
GET http://localhost:3001/api/squads
```
Fallback static URL is available at `/squads.json`.

### 2. REST Countries Bearer Token Configuration
Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Add your REST Countries API token:

```env
VITE_REST_COUNTRIES_BEARER_TOKEN=rc_live_your_actual_bearer_token_here
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Running the Development Server

1. Navigate to the project directory:
   ```bash
   cd e:\allcricket
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

4. Open your browser at `http://localhost:3001`.

### Production Build

```bash
npm run build
```

---

## 🛠️ Tech Stack

- **Core & Logic**: React 18 + TypeScript + Vite
- **Styling & UI**: Vanilla CSS + Tailwind CSS
- **Animations & Physics**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **Audio Synthesizer & Speech**: Web Audio API + Web Speech API (SpeechSynthesis)
- **API Services**: Squads API (`/api/squads`) + REST Countries v5 (`/api-restcountries`)
