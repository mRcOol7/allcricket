import React from 'react';
import { Country } from '../types/cricket';
import { getFullPlayingXI } from '../engine/cricketPlayerNames';
import { X, Shield, Users, User, Award, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TeamProfileModalProps {
  country: Country | null;
  onClose: () => void;
}

export const TeamProfileModal: React.FC<TeamProfileModalProps> = ({ country, onClose }) => {
  if (!country) return null;

  const playingXI = getFullPlayingXI(country.id, country.region);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl max-h-[85vh] sm:max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col overflow-hidden"
        >
          {/* Top Bar (Sticky Header) */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 flex-shrink-0">
            <div className="flex items-center space-x-3 min-w-0">
              <img
                src={country.flagUrl}
                alt={country.name}
                className="w-10 h-7 rounded object-cover border border-slate-700 shadow flex-shrink-0"
              />
              <div className="min-w-0">
                <h2 className="text-base font-extrabold text-white truncate">{country.name}</h2>
                <p className="text-xs text-slate-400 font-mono">
                  {country.officialName} • {country.fifaCode || country.isoCode}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center justify-center border border-slate-700"
              title="Close Team Profile"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto pr-1 space-y-5 pt-3 flex-1 scrollbar-thin">

            {/* Country Metadata Cards */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Region</span>
                <span className="font-bold text-emerald-400 mt-0.5 block truncate">{country.region}</span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                <span className="font-bold text-teal-400 mt-0.5 block">
                  {country.isSovereign ? 'Sovereign' : 'Territory'}
                </span>
              </div>
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Population</span>
                <span className="font-bold text-amber-400 mt-0.5 font-mono block">
                  {(country.population / 1000000).toFixed(1)}M
                </span>
              </div>
            </div>

            {/* Playing XI Roster */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Users className="w-4 h-4" />
                  <span>T20 Playing XI Squad Roster</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">11 Players</span>
              </div>

              {/* Disclaimer Alert */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-mono flex items-center space-x-2">
                <span className="text-amber-400 font-bold select-none">⚠️</span>
                <span>Disclaimer: Player names & ratings are procedurally simulated for tournament play and may be incorrect or fictional.</span>
              </div>

              <div className="space-y-2">
                {playingXI.map((player, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 text-xs"
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="w-5 font-mono font-bold text-slate-500 text-center">{idx + 1}.</span>
                      <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="font-bold text-slate-200 truncate">{player.name}</span>
                    </div>

                    <div className="flex items-center space-x-2 font-mono text-[11px]">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          player.role === 'Wicket Keeper'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            : player.role === 'All-Rounder'
                            ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                            : player.role === 'Bowler'
                            ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {player.role}
                      </span>
                      <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-bold">
                        {player.rating} OVR
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
