import React from 'react';
import { useCricketStore } from '../store/useCricketStore';
import { X, Flame, Shield, Activity, Award, Trophy, Zap, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const TournamentStatsModal: React.FC = () => {
  const { currentTournament, isStatsOpen, toggleStats } = useCricketStore();

  if (!isStatsOpen || !currentTournament || !currentTournament.awards) return null;

  const awards = currentTournament.awards;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-purple-600 p-[2px]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Tournament Stats & Leaderboards</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {currentTournament.name}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggleStats(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center border border-slate-700"
              title="Close Stats"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto pr-1 space-y-6 pt-3 flex-1 scrollbar-thin">

          {/* Top Aggregate Stat Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Runs</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{awards.totalRuns.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Wickets</span>
              <span className="text-lg font-black text-purple-400 font-mono">{awards.totalWickets.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total 6s Hit</span>
              <span className="text-lg font-black text-amber-400 font-mono">💥 {awards.totalSixes.toLocaleString()}</span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total 4s Hit</span>
              <span className="text-lg font-black text-teal-400 font-mono">🏏 {awards.totalFours.toLocaleString()}</span>
            </div>
          </div>

          {/* Leaderboards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Top 5 Batters */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>Orange Cap Leaderboard (Top 5)</span>
              </div>
              <div className="space-y-2">
                {awards.topBatters && awards.topBatters.length > 0 ? (
                  awards.topBatters.map((batter, idx) => (
                    <div
                      key={`${batter.player}_${idx}`}
                      className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 text-xs"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-5 font-mono font-bold text-slate-500 text-center">{idx + 1}.</span>
                        <img
                          src={batter.team.flagUrl}
                          alt={batter.team.name}
                          className="w-5 h-3.5 rounded object-cover flex-shrink-0"
                        />
                        <span className="font-bold text-slate-200 truncate">{batter.player}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono font-bold text-xs border border-amber-500/20">
                        {batter.runs} Runs
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No batting data available yet.</p>
                )}
              </div>
            </div>

            {/* Top 5 Bowlers */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" />
                <span>Purple Cap Leaderboard (Top 5)</span>
              </div>
              <div className="space-y-2">
                {awards.topBowlers && awards.topBowlers.length > 0 ? (
                  awards.topBowlers.map((bowler, idx) => (
                    <div
                      key={`${bowler.player}_${idx}`}
                      className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 text-xs"
                    >
                      <div className="flex items-center space-x-2 min-w-0">
                        <span className="w-5 font-mono font-bold text-slate-500 text-center">{idx + 1}.</span>
                        <img
                          src={bowler.team.flagUrl}
                          alt={bowler.team.name}
                          className="w-5 h-3.5 rounded object-cover flex-shrink-0"
                        />
                        <span className="font-bold text-slate-200 truncate">{bowler.player}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-bold text-xs border border-purple-500/20">
                        {bowler.wickets} Wkts
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No bowling data available yet.</p>
                )}
              </div>
            </div>

          </div>

          <div className="pt-2 text-center text-xs text-slate-500 pb-2">
            Stats update automatically after every simulated round.
          </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
