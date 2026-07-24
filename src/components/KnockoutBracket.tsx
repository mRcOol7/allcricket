import React, { useState, useEffect } from 'react';
import { CricketTournament, CricketRound, CricketMatch, Country } from '../types/cricket';
import { useCricketStore } from '../store/useCricketStore';
import { TeamProfileModal } from './TeamProfileModal';
import { Trophy, ChevronRight, CheckCircle2, Target, Shield, Activity, Flame, Search, FastForward, BarChart3, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface KnockoutBracketProps {
  tournament: CricketTournament;
  onNextRound: () => void;
  onReset: () => void;
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({
  tournament,
  onNextRound,
  onReset
}) => {
  const [selectedRoundIdx, setSelectedRoundIdx] = useState<number>(tournament.currentRoundIndex);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [profileCountry, setProfileCountry] = useState<Country | null>(null);

  const { setSelectedMatch, toggleStats, simulateAllRounds } = useCricketStore();

  useEffect(() => {
    setSelectedRoundIdx(tournament.currentRoundIndex);
  }, [tournament.currentRoundIndex, tournament.rounds.length]);

  const currentRound = tournament.rounds[selectedRoundIdx] || tournament.rounds[tournament.rounds.length - 1];
  const isLatestRound = selectedRoundIdx === tournament.rounds.length - 1;
  const isCompleted = tournament.status === 'COMPLETED';
  const awards = tournament.awards;

  // Filter matches by country search query
  const filteredMatches = (currentRound?.matches || []).filter((match) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      match.homeTeam.name.toLowerCase().includes(q) ||
      match.awayTeam.name.toLowerCase().includes(q) ||
      match.homeTeam.isoCode.toLowerCase().includes(q) ||
      match.awayTeam.isoCode.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Cricket Stats Header Banner (Orange Cap & Purple Cap & Leaderboard Button) */}
      {awards && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-3.5 shadow-lg grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs items-center">
          
          {/* Orange Cap (Top Batter) */}
          <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                Orange Cap (Top Batter)
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 truncate">
                  {awards.orangeCap ? `${awards.orangeCap.player}` : 'N/A'}
                </span>
                {awards.orangeCap && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                    {awards.orangeCap.runs} Runs
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Purple Cap (Top Bowler) */}
          <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">
                Purple Cap (Top Bowler)
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 truncate">
                  {awards.purpleCap ? `${awards.purpleCap.player}` : 'N/A'}
                </span>
                {awards.purpleCap && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px]">
                    {awards.purpleCap.wickets} Wkts
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Tournament Totals */}
          <div className="flex items-center space-x-3 bg-slate-950/60 border border-slate-800 rounded-xl p-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                Tournament Totals
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100 truncate">
                  {awards.totalMatches} Matches
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                  {awards.totalSixes}x6 • {awards.totalFours}x4
                </span>
              </div>
            </div>
          </div>

          {/* Full Leaderboards Trigger */}
          <button
            onClick={() => toggleStats(true)}
            className="w-full h-full min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-emerald-500/20 border border-amber-500/40 hover:border-amber-400 text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 transition shadow-md"
          >
            <BarChart3 className="w-4 h-4 text-amber-400" />
            <span>Open Stats Leaderboard</span>
          </button>

        </div>
      )}

      {/* Round Selection Tabs & Header */}
      <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Round Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100 tracking-wide">
                  {currentRound ? currentRound.name : 'Knockout Round'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                  {filteredMatches.length} / {currentRound?.matches.length || 0} Matches
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Round {selectedRoundIdx + 1} of {tournament.rounds.length} • Click match card for scorecard or team flag for Playing XI squad
              </p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-wrap items-center space-x-2 w-full md:w-auto justify-end gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search nation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            <button
              onClick={onReset}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
            >
              Reset
            </button>

            {!isCompleted && (
              <button
                onClick={simulateAllRounds}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 text-xs font-semibold border border-amber-500/30 flex items-center space-x-1.5 transition"
                title="Instant auto-simulate all remaining rounds to final champion"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Simulate All</span>
              </button>
            )}

            {!isCompleted && isLatestRound && (
              <button
                onClick={onNextRound}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition transform active:scale-95"
              >
                <span>Next Round</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Round Navigation Bar */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
          {tournament.rounds.map((r, idx) => {
            const isActive = idx === selectedRoundIdx;
            const isCurrent = idx === tournament.currentRoundIndex;

            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoundIdx(idx)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{r.name}</span>
                {isCurrent && !isCompleted && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Matches Grid View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentRound?.id || selectedRoundIdx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredMatches.length > 0 ? (
            filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onClick={() => setSelectedMatch(match)}
                onSelectCountry={(c) => setProfileCountry(c)}
              />
            ))
          ) : (
            <div className="col-span-full py-12 text-center space-y-2 bg-slate-900/40 border border-slate-800 rounded-2xl">
              <Search className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">No nations matching "{searchQuery}" in this round</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Playing XI Team Profile Modal */}
      <TeamProfileModal country={profileCountry} onClose={() => setProfileCountry(null)} />
    </div>
  );
};

interface MatchCardProps {
  match: CricketMatch;
  onClick?: () => void;
  onSelectCountry?: (country: Country) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onClick, onSelectCountry }) => {
  const homeWins = match.winnerId === match.homeTeam.id;
  const awayWins = match.winnerId === match.awayTeam.id;

  const handleCountryClick = (e: React.MouseEvent, country: Country) => {
    if (onSelectCountry) {
      e.stopPropagation();
      onSelectCountry(country);
    }
  };

  if (match.isBye) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-xl p-3.5 flex items-center justify-between">
        <div
          onClick={(e) => handleCountryClick(e, match.homeTeam)}
          className="flex items-center space-x-3 cursor-pointer hover:text-emerald-400 transition"
        >
          {match.homeTeam.flagUrl ? (
            <img
              src={match.homeTeam.flagUrl}
              alt={match.homeTeam.name}
              className="w-7 h-5 object-cover rounded shadow-sm hover:scale-105 transition"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="text-base">{match.homeTeam.emoji}</span>
          )}
          <span className="font-semibold text-sm text-slate-200">{match.homeTeam.name}</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-medium">
          BYE
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-slate-900/70 backdrop-blur-xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-emerald-500/10 rounded-xl p-3.5 shadow-lg transition flex flex-col justify-between space-y-3 cursor-pointer group"
    >
      
      {/* Home Team Row */}
      <div
        className={`flex items-center justify-between p-2 rounded-lg transition ${
          homeWins
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-white font-bold'
            : 'bg-slate-950/40 text-slate-400'
        }`}
      >
        <div
          onClick={(e) => handleCountryClick(e, match.homeTeam)}
          className="flex items-center space-x-2.5 min-w-0 cursor-pointer hover:opacity-90 transition"
          title="Click to view Playing XI squad"
        >
          {match.homeTeam.flagUrl ? (
            <img
              src={match.homeTeam.flagUrl}
              alt={match.homeTeam.name}
              className="w-7 h-5 object-cover rounded shadow border border-slate-700 flex-shrink-0 hover:scale-110 transition"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="text-base flex-shrink-0">{match.homeTeam.emoji}</span>
          )}
          <span className="text-xs sm:text-sm font-semibold truncate hover:underline">
            {match.homeTeam.name}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 flex-shrink-0">
            {match.homeTeam.fifaCode || match.homeTeam.isoCode}
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 font-mono">
          {homeWins && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span className={`px-2 py-1 rounded-md text-xs sm:text-sm font-bold ${
            homeWins ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {match.homeRuns}/{match.homeWickets} <span className="text-[10px] font-normal opacity-80">({match.homeOvers})</span>
          </span>
        </div>
      </div>

      {/* Match Details & Performers */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="text-slate-600 uppercase tracking-wider text-[10px] group-hover:text-emerald-400 transition">
            {match.roundName} • Click for Scorecard 🔍
          </span>
          {match.isSuperOver && (
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium text-[10px]">
              SUPER OVER ({match.superOverHomeRuns} vs {match.superOverAwayRuns})
            </span>
          )}
        </div>

        {/* Top Batter & Top Bowler Summary */}
        <div className="text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800/60 flex flex-col space-y-0.5">
          {match.topBatter && (
            <div className="truncate">
              <span className="text-amber-400 font-bold">🏏 Top Batter:</span> {match.topBatter.player} ({match.topBatter.runs} runs, {match.topBatter.balls}b)
            </div>
          )}
          {match.topBowler && (
            <div className="truncate">
              <span className="text-purple-400 font-bold">⚾ Top Bowler:</span> {match.topBowler.player} ({match.topBowler.wickets}/{match.topBowler.runsGiven})
            </div>
          )}
        </div>
      </div>

      {/* Away Team Row */}
      <div
        className={`flex items-center justify-between p-2 rounded-lg transition ${
          awayWins
            ? 'bg-emerald-500/10 border border-emerald-500/30 text-white font-bold'
            : 'bg-slate-950/40 text-slate-400'
        }`}
      >
        <div
          onClick={(e) => handleCountryClick(e, match.awayTeam)}
          className="flex items-center space-x-2.5 min-w-0 cursor-pointer hover:opacity-90 transition"
          title="Click to view Playing XI squad"
        >
          {match.awayTeam.flagUrl ? (
            <img
              src={match.awayTeam.flagUrl}
              alt={match.awayTeam.name}
              className="w-7 h-5 object-cover rounded shadow border border-slate-700 flex-shrink-0 hover:scale-110 transition"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <span className="text-base flex-shrink-0">{match.awayTeam.emoji}</span>
          )}
          <span className="text-xs sm:text-sm font-semibold truncate hover:underline">
            {match.awayTeam.name}
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 flex-shrink-0">
            {match.awayTeam.fifaCode || match.awayTeam.isoCode}
          </span>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0 font-mono">
          {awayWins && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span className={`px-2 py-1 rounded-md text-xs sm:text-sm font-bold ${
            awayWins ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
          }`}>
            {match.awayRuns}/{match.awayWickets} <span className="text-[10px] font-normal opacity-80">({match.awayOvers})</span>
          </span>
        </div>
      </div>

    </div>
  );
};
