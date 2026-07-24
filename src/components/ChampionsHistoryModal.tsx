import React from 'react';
import { PastChampionRecord } from '../types/cricket';
import { X, Trophy, Award, Flame, Shield, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChampionsHistoryModalProps {
  isOpen: boolean;
  history: PastChampionRecord[];
  onClose: () => void;
  onClearHistory: () => void;
}

export const ChampionsHistoryModal: React.FC<ChampionsHistoryModalProps> = ({
  isOpen,
  history,
  onClose,
  onClearHistory
}) => {
  if (!isOpen) return null;

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 p-[2px]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Hall of Champions & Trophy Cabinet</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {history.length} Past World Cup Champions Recorded
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition border border-slate-700"
                  title="Clear History"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
                title="Close Hall of Champions"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto pr-1 space-y-4 pt-3 flex-1 scrollbar-thin">
            {history.length > 0 ? (
              history.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 space-y-3 shadow-lg transition"
                >
                  {/* Title & Date */}
                  <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                    <span className="font-bold text-amber-400 uppercase tracking-wider font-mono">
                      🏆 {rec.tournamentName}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{rec.date}</span>
                  </div>

                  {/* Champion Banner */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-xl p-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={rec.champion.flagUrl}
                        alt={rec.champion.name}
                        className="w-10 h-7 rounded object-cover shadow border border-slate-700"
                      />
                      <div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                          World Champion
                        </span>
                        <span className="font-extrabold text-sm text-slate-100">{rec.champion.name}</span>
                      </div>
                    </div>

                    {rec.runnerUp && (
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                          Runner-Up
                        </span>
                        <span className="font-bold text-xs text-slate-300">{rec.runnerUp.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Individual Caps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {rec.orangeCapPlayer && (
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
                        <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-amber-400 font-bold block">Orange Cap</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {rec.orangeCapPlayer} ({rec.orangeCapRuns} Runs)
                          </span>
                        </div>
                      </div>
                    )}

                    {rec.purpleCapPlayer && (
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex items-center space-x-2">
                        <Shield className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] text-purple-400 font-bold block">Purple Cap</span>
                          <span className="font-bold text-slate-200 truncate block">
                            {rec.purpleCapPlayer} ({rec.purpleCapWickets} Wickets)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-2 bg-slate-950/40 border border-slate-800 rounded-2xl">
                <Trophy className="w-10 h-10 text-slate-700 mx-auto" />
                <h3 className="text-sm font-bold text-slate-300">No Past Champions Saved Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Simulate a World Cup to completion to automatically record your first champion in the Hall of Fame!
                </p>
              </div>
            )}

            <div className="pt-1 text-center text-[10px] text-amber-400/70 font-mono pb-2">
              ⚠️ Disclaimer: Historical champion records and player awards are procedurally simulated for tournament representation and may be incorrect or fictional.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
