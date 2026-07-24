import React, { useEffect } from 'react';
import { CricketTournament } from '../types/cricket';
import { Trophy, RefreshCw, Sparkles, Award, Shield, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

interface ChampionCelebrationProps {
  tournament: CricketTournament;
  onRestart: () => void;
}

export const ChampionCelebration: React.FC<ChampionCelebrationProps> = ({
  tournament,
  onRestart
}) => {
  const champion = tournament.champion;
  const runnerUp = tournament.runnerUp;
  const awards = tournament.awards;

  useEffect(() => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  if (!champion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg overflow-y-auto scrollbar-thin">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl shadow-amber-500/10 text-center space-y-6 relative overflow-hidden my-auto"
      >
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 p-[2px] shadow-lg shadow-amber-500/20 animate-bounce">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Cricket World Cup Champion</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {champion.name}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            {champion.officialName !== champion.name ? champion.officialName : champion.region}
          </p>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-center space-x-4">
            {champion.flagUrl ? (
              <img
                src={champion.flagUrl}
                alt={champion.name}
                className="w-20 h-14 object-cover rounded-lg shadow-lg border border-slate-700"
              />
            ) : (
              <span className="text-5xl">{champion.emoji}</span>
            )}
          </div>

          <div className="flex items-center justify-center space-x-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold">
              ICC: {champion.fifaCode || champion.isoCode}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
              Region: {champion.region}
            </span>
          </div>
        </div>

        {/* Cricket Awards: Orange Cap & Purple Cap */}
        {awards && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            {/* Orange Cap */}
            {awards.orangeCap && (
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Flame className="w-4 h-4" />
                  <span>Orange Cap (Top Batter)</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{awards.orangeCap.player}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {awards.orangeCap.team.flagUrl && (
                      <img src={awards.orangeCap.team.flagUrl} alt="" className="w-4 h-3 object-cover rounded" />
                    )}
                    <span className="text-xs text-slate-400">{awards.orangeCap.team.name}</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Total Runs:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold text-xs">
                    {awards.orangeCap.runs} Runs
                  </span>
                </div>
              </div>
            )}

            {/* Purple Cap */}
            {awards.purpleCap && (
              <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3.5 flex flex-col justify-between space-y-2">
                <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                  <Shield className="w-4 h-4" />
                  <span>Purple Cap (Top Bowler)</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{awards.purpleCap.player}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    {awards.purpleCap.team.flagUrl && (
                      <img src={awards.purpleCap.team.flagUrl} alt="" className="w-4 h-3 object-cover rounded" />
                    )}
                    <span className="text-xs text-slate-400">{awards.purpleCap.team.name}</span>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Total Wickets:</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-mono font-bold text-xs">
                    {awards.purpleCap.wickets} Wkts
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Runner Up */}
        {runnerUp && (
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <span className="text-slate-400 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-slate-400" />
              <span>Runner-Up (2nd Place):</span>
            </span>
            <span className="font-bold text-slate-200 flex items-center space-x-2">
              {runnerUp.flagUrl && (
                <img src={runnerUp.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded" />
              )}
              <span>{runnerUp.name}</span>
            </span>
          </div>
        )}

        <button
          onClick={onRestart}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition transform active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Start New Cricket Tournament</span>
        </button>
      </motion.div>
    </div>
  );
};
