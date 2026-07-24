import React, { useState } from 'react';
import { useCricketStore } from '../store/useCricketStore';
import { Country } from '../types/cricket';
import { Search, Globe, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CountryDirectory: React.FC = () => {
  const { allCountries, sovereignCountries, isDirectoryOpen, toggleDirectory } = useCricketStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'SOVEREIGN' | 'DEPENDENCY'>('ALL');

  if (!isDirectoryOpen) return null;

  const filteredCountries = allCountries.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.officialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.isoCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fifaCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.region.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'SOVEREIGN') return c.isSovereign;
    if (filterType === 'DEPENDENCY') return !c.isSovereign;
    return true;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl">
                🏏
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <span>Cricket World Cup Nations</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                    {allCountries.length} Total Records
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  {sovereignCountries.length} Sovereign Nations available for Cricket World Cup Knockout
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleDirectory(false)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search nation, ICC code, region..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterType === 'ALL' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({allCountries.length})
              </button>
              <button
                onClick={() => setFilterType('SOVEREIGN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterType === 'SOVEREIGN' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Sovereign ({sovereignCountries.length})
              </button>
              <button
                onClick={() => setFilterType('DEPENDENCY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterType === 'DEPENDENCY' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Territories ({allCountries.length - sovereignCountries.length})
              </button>
            </div>
          </div>

          {/* Directory Grid */}
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 scrollbar-thin">
            {filteredCountries.map((country) => (
              <div
                key={country.id}
                className="bg-slate-950/60 border border-slate-800 hover:border-slate-700/80 rounded-xl p-3 flex flex-col justify-between space-y-2 shadow"
              >
                <div className="flex items-start space-x-3">
                  {country.flagUrl ? (
                    <img
                      src={country.flagUrl}
                      alt={country.name}
                      className="w-10 h-7 object-cover rounded shadow border border-slate-700 flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-2xl flex-shrink-0">{country.emoji}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-100 truncate">{country.name}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{country.region}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/60">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                    {country.fifaCode || country.isoCode}
                  </span>
                  {country.isSovereign ? (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-sans font-medium">
                      Sovereign
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 font-sans">
                      Territory
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-slate-800 bg-slate-950 text-center text-xs text-slate-500 space-y-1">
            <div>Showing {filteredCountries.length} of {allCountries.length} Cricket World Cup Nations</div>
            <div className="text-[10px] text-amber-400/70 font-mono">
              ⚠️ Disclaimer: Country data & codes are fetched via REST Countries v5 API for simulation representation.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
