import React, { useState } from 'react';
import { useCricketStore } from '../store/useCricketStore';
import { Country, PitchType } from '../types/cricket';
import { simulateCricketMatch } from '../engine/cricketEngine';
import { X, Swords, Trophy, Play, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HeadToHeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HeadToHeadModal: React.FC<HeadToHeadModalProps> = ({ isOpen, onClose }) => {
  const { allCountries } = useCricketStore();

  const [team1Id, setTeam1Id] = useState<string>(allCountries[0]?.id || '');
  const [team2Id, setTeam2Id] = useState<string>(allCountries[1]?.id || '');
  const [pitchType, setPitchType] = useState<PitchType>('BALANCED');
  const [seriesLength, setSeriesLength] = useState<number>(5);
  const [seriesResult, setSeriesResult] = useState<{
    t1Wins: number;
    t2Wins: number;
    matches: Array<{ homeRuns: number; awayRuns: number; winnerName: string; isSuperOver?: boolean }>;
  } | null>(null);

  if (!isOpen) return null;

  const team1 = allCountries.find(c => c.id === team1Id) || allCountries[0];
  const team2 = allCountries.find(c => c.id === team2Id) || allCountries[1] || allCountries[0];

  const handleSimulate = () => {
    if (!team1 || !team2) return;
    let t1W = 0;
    let t2W = 0;
    const matchLogs = [];

    for (let i = 0; i < seriesLength; i++) {
      const match = simulateCricketMatch(team1, team2, `Match ${i + 1}`, pitchType);
      if (match.winnerId === team1.id) t1W++;
      else t2W++;

      matchLogs.push({
        homeRuns: match.homeRuns,
        awayRuns: match.awayRuns,
        winnerName: match.winnerId === team1.id ? team1.name : team2.name,
        isSuperOver: match.isSuperOver
      });
    }

    setSeriesResult({
      t1Wins: t1W,
      t2Wins: t2W,
      matches: matchLogs
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col overflow-hidden"
        >
          {/* Header (Sticky Header) */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-amber-500 p-[2px]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                  <Swords className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Head-to-Head Series Predictor</h2>
                <p className="text-xs text-slate-400">
                  Simulate custom T20 series between any 2 nations
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center border border-slate-700"
              title="Close H2H Predictor"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto pr-1 space-y-5 pt-3 flex-1 scrollbar-thin">

            {/* Selector Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Team 1 Selector */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Team 1</label>
                <select
                  value={team1Id}
                  onChange={(e) => { setTeam1Id(e.target.value); setSeriesResult(null); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {allCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name} ({c.isoCode})
                    </option>
                  ))}
                </select>
                {team1 && (
                  <div className="flex items-center space-x-2 pt-2">
                    <img src={team1.flagUrl} alt={team1.name} className="w-8 h-5 rounded object-cover border border-slate-700" />
                    <span className="font-bold text-xs text-slate-200">{team1.name}</span>
                  </div>
                )}
              </div>

              {/* Team 2 Selector */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Team 2</label>
                <select
                  value={team2Id}
                  onChange={(e) => { setTeam2Id(e.target.value); setSeriesResult(null); }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {allCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name} ({c.isoCode})
                    </option>
                  ))}
                </select>
                {team2 && (
                  <div className="flex items-center space-x-2 pt-2">
                    <img src={team2.flagUrl} alt={team2.name} className="w-8 h-5 rounded object-cover border border-slate-700" />
                    <span className="font-bold text-xs text-slate-200">{team2.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Match Settings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Pitch Condition</label>
                <select
                  value={pitchType}
                  onChange={(e) => setPitchType(e.target.value as PitchType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="BALANCED">⚖️ Balanced Track (140 - 180 runs)</option>
                  <option value="HIGH_SCORING">💥 Batter Paradise (180 - 230 runs)</option>
                  <option value="BOWLING_GREEN">⚡ Seam & Pace Friendly (110 - 150 runs)</option>
                  <option value="SPIN_PARADISE">🌀 Turning Track (120 - 160 runs)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Series Format</label>
                <select
                  value={seriesLength}
                  onChange={(e) => setSeriesLength(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                >
                  <option value={1}>1 Match Winner-Takes-All</option>
                  <option value={3}>Best of 3 T20 Series</option>
                  <option value={5}>Best of 5 T20 Series</option>
                  <option value={7}>7-Match Mega Series</option>
                </select>
              </div>
            </div>

            {/* Simulate Action Button */}
            <button
              onClick={handleSimulate}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 text-slate-950 font-extrabold text-sm shadow-xl flex items-center justify-center space-x-2 transition transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Simulate Head-to-Head Series</span>
            </button>

            {/* Series Result Section */}
            {seriesResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-5 space-y-4"
              >
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Series Simulation Outcome
                  </span>
                  <h3 className="text-2xl font-black text-white">
                    {seriesResult.t1Wins > seriesResult.t2Wins
                      ? `🏆 ${team1.name} Wins the Series ${seriesResult.t1Wins} - ${seriesResult.t2Wins}!`
                      : seriesResult.t2Wins > seriesResult.t1Wins
                      ? `🏆 ${team2.name} Wins the Series ${seriesResult.t2Wins} - ${seriesResult.t1Wins}!`
                      : `🤝 Series Drawn ${seriesResult.t1Wins} - ${seriesResult.t2Wins}!`}
                  </h3>
                </div>

                {/* Match Logs */}
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {seriesResult.matches.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono">
                      <span className="text-slate-400 font-bold">Match {idx + 1}</span>
                      <span className="text-slate-200">
                        {team1.name} {m.homeRuns} vs {team2.name} {m.awayRuns}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {m.winnerName} won {m.isSuperOver && ' (Super Over ⚡)'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
