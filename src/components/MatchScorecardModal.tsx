import React, { useEffect } from 'react';
import { useCricketStore } from '../store/useCricketStore';
import { X, Award, Flame, Shield, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundFx } from '../utils/soundFx';

export const MatchScorecardModal: React.FC = () => {
  const { selectedMatch, setSelectedMatch } = useCricketStore();

  useEffect(() => {
    if (selectedMatch) {
      if (selectedMatch.isSuperOver) {
        soundFx.playSuperOver();
      } else {
        soundFx.playSixHit();
      }
    }
  }, [selectedMatch]);

  if (!selectedMatch) return null;

  const homeWon = selectedMatch.winnerId === selectedMatch.homeTeam.id;
  const awayWon = selectedMatch.winnerId === selectedMatch.awayTeam.id;

  const homeRR = (selectedMatch.homeRuns / (parseFloat(selectedMatch.homeOvers) || 20)).toFixed(2);
  const awayRR = (selectedMatch.awayRuns / (parseFloat(selectedMatch.awayOvers) || 20)).toFixed(2);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col overflow-hidden"
        >
          {/* Top Bar (Sticky Header with Always Visible Close Button) */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold uppercase">
                {selectedMatch.roundName} Scorecard
              </span>
              {selectedMatch.isSuperOver && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[11px] font-bold uppercase">
                  ⚡ Super Over Tie
                </span>
              )}
            </div>
            <button
              onClick={() => setSelectedMatch(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center border border-slate-700"
              title="Close Scorecard"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto pr-1 space-y-4 pt-3 flex-1 scrollbar-thin">
            
            {/* Teams & Main Score Banner */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3 sm:p-4">
              {/* Home Team */}
              <div className={`flex flex-col items-center text-center p-3 rounded-xl transition ${homeWon ? 'bg-emerald-500/10 border border-emerald-500/30' : 'opacity-80'}`}>
                <img
                  src={selectedMatch.homeTeam.flagUrl}
                  alt={selectedMatch.homeTeam.name}
                  className="w-12 h-8 rounded object-cover shadow border border-slate-700 mb-2"
                />
                <span className="font-bold text-sm text-slate-200 line-clamp-1">{selectedMatch.homeTeam.name}</span>
                <div className="mt-1 font-mono font-black text-xl text-emerald-400">
                  {selectedMatch.homeRuns}/{selectedMatch.homeWickets}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ({selectedMatch.homeOvers} overs • RR: {homeRR})
                </div>
                {selectedMatch.isSuperOver && selectedMatch.superOverHomeRuns !== undefined && (
                  <div className="mt-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono text-[10px] font-bold">
                    Super Over: {selectedMatch.superOverHomeRuns} Runs
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className={`flex flex-col items-center text-center p-3 rounded-xl transition ${awayWon ? 'bg-emerald-500/10 border border-emerald-500/30' : 'opacity-80'}`}>
                <img
                  src={selectedMatch.awayTeam.flagUrl}
                  alt={selectedMatch.awayTeam.name}
                  className="w-12 h-8 rounded object-cover shadow border border-slate-700 mb-2"
                />
                <span className="font-bold text-sm text-slate-200 line-clamp-1">{selectedMatch.awayTeam.name}</span>
                <div className="mt-1 font-mono font-black text-xl text-emerald-400">
                  {selectedMatch.awayRuns}/{selectedMatch.awayWickets}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ({selectedMatch.awayOvers} overs • RR: {awayRR})
                </div>
                {selectedMatch.isSuperOver && selectedMatch.superOverAwayRuns !== undefined && (
                  <div className="mt-2 px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-mono text-[10px] font-bold">
                    Super Over: {selectedMatch.superOverAwayRuns} Runs
                  </div>
                )}
              </div>
            </div>

            {/* Player of the Match */}
            {selectedMatch.playerOfTheMatch && (
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-3.5 flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                    Player of the Match
                  </span>
                  <span className="font-bold text-sm text-slate-100">
                    {selectedMatch.playerOfTheMatch.player} ({selectedMatch.playerOfTheMatch.teamName})
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {selectedMatch.playerOfTheMatch.reason}
                  </p>
                </div>
              </div>
            )}

            {/* Innings Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Top Batter */}
              {selectedMatch.topBatter && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center space-x-2 text-amber-400 font-semibold text-[11px]">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Top Batter</span>
                  </div>
                  <div className="font-bold text-slate-200">{selectedMatch.topBatter.player}</div>
                  <div className="text-slate-400 text-[11px] font-mono flex items-center justify-between">
                    <span>{selectedMatch.topBatter.teamName}</span>
                    <span className="text-emerald-400 font-bold">
                      {selectedMatch.topBatter.runs} ({selectedMatch.topBatter.balls}b)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex space-x-2 pt-1 border-t border-slate-800/80">
                    <span>SR: {((selectedMatch.topBatter.runs / (selectedMatch.topBatter.balls || 1)) * 100).toFixed(1)}</span>
                    <span>•</span>
                    <span>4s: {selectedMatch.topBatter.fours || 0}</span>
                    <span>•</span>
                    <span>6s: {selectedMatch.topBatter.sixes || 0}</span>
                  </div>
                </div>
              )}

              {/* Top Bowler */}
              {selectedMatch.topBowler && (
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="flex items-center space-x-2 text-purple-400 font-semibold text-[11px]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Top Bowler</span>
                  </div>
                  <div className="font-bold text-slate-200">{selectedMatch.topBowler.player}</div>
                  <div className="text-slate-400 text-[11px] font-mono flex items-center justify-between">
                    <span>{selectedMatch.topBowler.teamName}</span>
                    <span className="text-purple-400 font-bold">
                      {selectedMatch.topBowler.wickets}/{selectedMatch.topBowler.runsGiven} ({selectedMatch.topBowler.overs || '4.0'}ov)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex space-x-2 pt-1 border-t border-slate-800/80">
                    <span>Econ: {selectedMatch.topBowler.economy || (selectedMatch.topBowler.runsGiven / 4).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Commentary Feed */}
            {selectedMatch.commentary && selectedMatch.commentary.length > 0 && (
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2 text-xs font-mono">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  🎙️ Match Highlights & Commentary
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {selectedMatch.commentary.map((line, idx) => (
                    <div key={idx} className="text-slate-300 text-[11px] flex items-start space-x-1.5 border-b border-slate-900 pb-1">
                      <span className="text-emerald-500 font-bold select-none">•</span>
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1 text-center text-[10px] text-amber-400/70 font-mono pb-2">
              ⚠️ Disclaimer: Player names and scores are procedurally simulated for tournament representation and may be incorrect or fictional.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
