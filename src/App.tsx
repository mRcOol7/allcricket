import React, { useEffect, useState } from 'react';
import { useCricketStore } from './store/useCricketStore';
import { KnockoutBracket } from './components/KnockoutBracket';
import { CountryDirectory } from './components/CountryDirectory';
import { ChampionCelebration } from './components/ChampionCelebration';
import { MatchScorecardModal } from './components/MatchScorecardModal';
import { TournamentStatsModal } from './components/TournamentStatsModal';
import { HeadToHeadModal } from './components/HeadToHeadModal';
import { TournamentReportModal } from './components/TournamentReportModal';
import { ChampionsHistoryModal } from './components/ChampionsHistoryModal';
import { LiveMatchSimulatorModal } from './components/LiveMatchSimulatorModal';
import { initSquadsFromApi } from './engine/cricketPlayerNames';
import { CricketTournamentSize, PitchType } from './types/cricket';
import { Globe, Play, ShieldCheck, Sparkles, BarChart3, Swords, FileText, Trophy, Volume2, VolumeX, Radio } from 'lucide-react';
import { soundFx } from './utils/soundFx';

export const App: React.FC = () => {
  const {
    allCountries,
    isLoadingCountries,
    currentTournament,
    bracketSize,
    pitchType,
    pastChampions,
    loadCountries,
    setBracketSize,
    setPitchType,
    startTournament,
    nextRound,
    resetTournament,
    toggleDirectory,
    toggleStats,
    clearHistory
  } = useCricketStore();

  const [isH2HOpen, setIsH2HOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLiveSimOpen, setIsLiveSimOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundFx.isMuted);

  const toggleMute = () => {
    soundFx.isMuted = !soundFx.isMuted;
    setIsMuted(soundFx.isMuted);
  };

  useEffect(() => {
    loadCountries();
    initSquadsFromApi();
  }, [loadCountries]);

  if (isLoadingCountries && allCountries.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center space-y-4 text-slate-100 p-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 p-[2px] animate-spin">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
            🏏
          </div>
        </div>
        <div className="text-center space-y-1">
          <h2 className="text-lg font-black tracking-wider uppercase">Loading Cricket World Cup Simulator</h2>
          <p className="text-xs text-slate-400 font-mono">
            Fetching ~254 Countries via REST Countries v5 API...
          </p>
        </div>
      </div>
    );
  }

  const currentRoundNum = currentTournament ? currentTournament.currentRoundIndex + 1 : 0;
  const totalRoundsNum = currentTournament ? currentTournament.rounds.length : 0;
  const progressPercent = currentTournament
    ? Math.round((currentRoundNum / (totalRoundsNum || 1)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Glass Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-400 p-[2px] shadow-lg shadow-emerald-500/10">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-xl">
                🏏
              </div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Cricket World Cup Knockout Simulator
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                REST Countries v5 • Ball-by-Ball Live Sim • Playing XI Squads • Hall of Champions
              </p>
            </div>
          </div>

          {/* Action Header Triggers */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsLiveSimOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-xs text-emerald-400 font-bold flex items-center space-x-1.5 transition animate-pulse"
              title="Live Ball-by-Ball Simulator"
            >
              <Radio className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Live Ticker</span>
            </button>

            <button
              onClick={toggleMute}
              className={`p-2 rounded-xl border text-xs transition flex items-center justify-center ${
                isMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-amber-400 flex items-center space-x-1.5 transition relative"
              title="Hall of Champions History"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">History</span>
              {pastChampions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                  {pastChampions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsH2HOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-emerald-400 flex items-center space-x-1.5 transition"
            >
              <Swords className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Head-to-Head</span>
            </button>

            {currentTournament && (
              <>
                <button
                  onClick={() => toggleStats(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-amber-400 flex items-center space-x-1.5 transition"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Stats</span>
                </button>

                <button
                  onClick={() => setIsReportOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-teal-400 flex items-center space-x-1.5 transition"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline font-medium">Report</span>
                </button>
              </>
            )}

            <button
              onClick={() => toggleDirectory(true)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 flex items-center space-x-2 transition"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline font-medium">Nations</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                {allCountries.length}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Single Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Hero Setup Panel */}
        {!currentTournament ? (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{allCountries.length} Nations & Territories Loaded</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Simulate 256-Team Mega Cricket World Cup
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Every nation and territory plays in Round 1. Click any team flag to inspect their Playing XI squad, run live ball-by-ball commentary, and save champions to your Hall of Fame!
              </p>
            </div>

            {/* Bracket & Pitch Controls */}
            <div className="max-w-md mx-auto bg-slate-950/70 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Tournament Bracket Format
                </label>
                <select
                  value={bracketSize}
                  onChange={(e) => setBracketSize(Number(e.target.value) as CricketTournamentSize)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value={256}>
                    256 Teams Mega Bracket (128 Matches in R1 • All 256 teams play!)
                  </option>
                  <option value={128}>
                    128 Teams Bracket (64 Matches in R1)
                  </option>
                  <option value={64}>
                    64 Teams Bracket (32 Matches in R1)
                  </option>
                  <option value={32}>
                    32 Teams Bracket (16 Matches in R1)
                  </option>
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Pitch & Venue Conditions
                </label>
                <select
                  value={pitchType}
                  onChange={(e) => setPitchType(e.target.value as PitchType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:border-emerald-500 transition"
                >
                  <option value="BALANCED">⚖️ Balanced Pitch (140 - 180 runs)</option>
                  <option value="HIGH_SCORING">💥 Batter Paradise (180 - 230 runs)</option>
                  <option value="BOWLING_GREEN">⚡ Seam & Pace Heavy (110 - 150 runs)</option>
                  <option value="SPIN_PARADISE">🌀 Turning Track (120 - 160 runs)</option>
                </select>
              </div>

              <button
                onClick={startTournament}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 transition transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start 256-Team Cricket Tournament</span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Tournament View */
          <div className="space-y-6">
            {/* Progress Bar Header */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300 font-medium">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold">{currentTournament.name}</span>
                </div>
                <div className="font-mono text-slate-400">
                  Round {currentRoundNum} / {totalRoundsNum}
                </div>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800/80">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Knockout Bracket Grid */}
            <KnockoutBracket
              tournament={currentTournament}
              onNextRound={nextRound}
              onReset={resetTournament}
            />
          </div>
        )}

      </main>

      {/* Champion Modal */}
      {currentTournament && currentTournament.status === 'COMPLETED' && (
        <ChampionCelebration tournament={currentTournament} onRestart={resetTournament} />
      )}

      {/* Interactive Match Scorecard Modal */}
      <MatchScorecardModal />

      {/* Head to Head Series Predictor Modal */}
      <HeadToHeadModal isOpen={isH2HOpen} onClose={() => setIsH2HOpen(false)} />

      {/* Live Ball-by-Ball Match Simulator Modal */}
      <LiveMatchSimulatorModal isOpen={isLiveSimOpen} onClose={() => setIsLiveSimOpen(false)} />

      {/* Full Leaderboard Stats Modal */}
      <TournamentStatsModal />

      {/* Markdown Report Modal */}
      <TournamentReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />

      {/* Hall of Champions History Modal */}
      <ChampionsHistoryModal
        isOpen={isHistoryOpen}
        history={pastChampions}
        onClose={() => setIsHistoryOpen(false)}
        onClearHistory={clearHistory}
      />

      {/* Directory Modal */}
      <CountryDirectory />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500 space-y-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Cricket World Cup Knockout Simulator</span>
          <span>REST Countries v5 API • Ball-by-Ball Live Sim • Playing XI Squads • Hall of Champions</span>
        </div>
        <p className="text-[11px] text-amber-400/70 font-mono text-center">
          ⚠️ Disclaimer: All player names, ratings, and match performances are procedurally simulated for tournament play and may be incorrect or fictional.
        </p>
      </footer>

    </div>
  );
};

export default App;
