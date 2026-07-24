import React, { useState, useEffect } from 'react';
import { Country, PitchType } from '../types/cricket';
import { useCricketStore } from '../store/useCricketStore';
import { getFullPlayingXI, CricketPlayerProfile } from '../engine/cricketPlayerNames';
import { soundFx } from '../utils/soundFx';
import { X, Play, Pause, RotateCcw, Zap, Flame, Shield, Trophy, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LivePlayerStat {
  name: string;
  teamName: string;
  teamFlag: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  wickets: number;
  bowlerRuns: number;
  bowlerBalls: number;
}

interface LiveMatchSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveMatchSimulatorModal: React.FC<LiveMatchSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { allCountries, pitchType } = useCricketStore();

  const [homeTeam, setHomeTeam] = useState<Country>(allCountries[0] || null);
  const [awayTeam, setAwayTeam] = useState<Country>(allCountries[1] || null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentInnings, setCurrentInnings] = useState<1 | 2>(1);
  const [ballIndex1, setBallIndex1] = useState(0); // 0 to 30 (5 overs)
  const [ballIndex2, setBallIndex2] = useState(0); // 0 to 30 (5 overs)

  const [homeScore, setHomeScore] = useState({ runs: 0, wickets: 0 });
  const [awayScore, setAwayScore] = useState({ runs: 0, wickets: 0 });

  // Squad Roster & Active Crease State
  const [homeSquad, setHomeSquad] = useState<CricketPlayerProfile[]>([]);
  const [awaySquad, setAwaySquad] = useState<CricketPlayerProfile[]>([]);

  // Detailed Stats Maps (mapped by player index)
  const [homeStats, setHomeStats] = useState<Record<number, LivePlayerStat>>({});
  const [awayStats, setAwayStats] = useState<Record<number, LivePlayerStat>>({});

  // Innings 1 Crease Tracking (Home Team Batting)
  const [strikerIdx1, setStrikerIdx1] = useState(0);
  const [nonStrikerIdx1, setNonStrikerIdx1] = useState(1);
  const [nextBatterIdx1, setNextBatterIdx1] = useState(2);
  const [bowlerIdx1, setBowlerIdx1] = useState(7); // Bowler from awaySquad

  // Innings 2 Crease Tracking (Away Team Batting)
  const [strikerIdx2, setStrikerIdx2] = useState(0);
  const [nonStrikerIdx2, setNonStrikerIdx2] = useState(1);
  const [nextBatterIdx2, setNextBatterIdx2] = useState(2);
  const [bowlerIdx2, setBowlerIdx2] = useState(7); // Bowler from homeSquad

  const [matchStatus, setMatchStatus] = useState<'NOT_STARTED' | 'INNINGS_1' | 'INNINGS_BREAK' | 'INNINGS_2' | 'FINISHED'>('NOT_STARTED');
  const [winnerMessage, setWinnerMessage] = useState<string>('');

  const [ballsHistory, setBallsHistory] = useState<Array<{ innings: 1 | 2; ballNum: string; text: string; runs: number; isWicket?: boolean; isSix?: boolean; isFour?: boolean }>>([]);

  useEffect(() => {
    if (!homeTeam && allCountries.length > 0) setHomeTeam(allCountries[0]);
    if (!awayTeam && allCountries.length > 1) setAwayTeam(allCountries[1]);
  }, [allCountries]);

  // Generate squads & init stats maps when teams change
  useEffect(() => {
    if (homeTeam && awayTeam) {
      const hSquad = getFullPlayingXI(homeTeam.id, homeTeam.region);
      const aSquad = getFullPlayingXI(awayTeam.id, awayTeam.region);
      setHomeSquad(hSquad);
      setAwaySquad(aSquad);
      resetMatch(hSquad, aSquad);
    }
  }, [homeTeam?.id, awayTeam?.id]);

  const initPlayerStats = (hSquad: CricketPlayerProfile[], aSquad: CricketPlayerProfile[], hTeam: Country, aTeam: Country) => {
    const hMap: Record<number, LivePlayerStat> = {};
    hSquad.forEach((p, idx) => {
      hMap[idx] = {
        name: p.name,
        teamName: hTeam.name,
        teamFlag: hTeam.flagUrl,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        wickets: 0,
        bowlerRuns: 0,
        bowlerBalls: 0
      };
    });

    const aMap: Record<number, LivePlayerStat> = {};
    aSquad.forEach((p, idx) => {
      aMap[idx] = {
        name: p.name,
        teamName: aTeam.name,
        teamFlag: aTeam.flagUrl,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        isOut: false,
        wickets: 0,
        bowlerRuns: 0,
        bowlerBalls: 0
      };
    });

    setHomeStats(hMap);
    setAwayStats(aMap);
  };

  // Timer loop for ball-by-ball simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && matchStatus !== 'FINISHED') {
      timer = setTimeout(() => {
        simulateNextBall();
      }, 650);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentInnings, ballIndex1, ballIndex2, matchStatus, homeScore, awayScore, strikerIdx1, nonStrikerIdx1, nextBatterIdx1, bowlerIdx1, strikerIdx2, nonStrikerIdx2, nextBatterIdx2, bowlerIdx2, homeStats, awayStats]);

  const resetMatch = (hSquadToUse?: CricketPlayerProfile[], aSquadToUse?: CricketPlayerProfile[]) => {
    setIsPlaying(false);
    setCurrentInnings(1);
    setBallIndex1(0);
    setBallIndex2(0);
    setHomeScore({ runs: 0, wickets: 0 });
    setAwayScore({ runs: 0, wickets: 0 });

    setStrikerIdx1(0);
    setNonStrikerIdx1(1);
    setNextBatterIdx1(2);
    setBowlerIdx1(7);

    setStrikerIdx2(0);
    setNonStrikerIdx2(1);
    setNextBatterIdx2(2);
    setBowlerIdx2(7);

    const hSq = hSquadToUse || homeSquad;
    const aSq = aSquadToUse || awaySquad;
    if (hSq.length > 0 && aSq.length > 0) {
      initPlayerStats(hSq, aSq, homeTeam, awayTeam);
    }

    setMatchStatus('NOT_STARTED');
    setWinnerMessage('');
    setBallsHistory([]);
  };

  const simulateNextBall = () => {
    if (matchStatus === 'FINISHED') {
      setIsPlaying(false);
      return;
    }

    let boundaryProb = 0.22;
    let wicketProb = 0.08;
    if (pitchType === 'HIGH_SCORING') boundaryProb = 0.35;
    else if (pitchType === 'BOWLING_GREEN') wicketProb = 0.15;
    else if (pitchType === 'SPIN_PARADISE') { boundaryProb = 0.18; wicketProb = 0.12; }

    // --- INNINGS 1 (Home Team Bats 5 Overs) ---
    if (currentInnings === 1) {
      setMatchStatus('INNINGS_1');
      if (ballIndex1 >= 30 || homeScore.wickets >= 10) {
        setCurrentInnings(2);
        setMatchStatus('INNINGS_2');
        soundFx.playSuperOver();
        return;
      }

      const overNum = Math.floor(ballIndex1 / 6) + 1;
      const ballInOver = (ballIndex1 % 6) + 1;
      const ballLabel = `${overNum}.${ballInOver}`;

      const batterObj = homeSquad[strikerIdx1] || { name: `Batter ${strikerIdx1 + 1}` };
      const bowlerObj = awaySquad[bowlerIdx1] || { name: `Bowler ${bowlerIdx1 + 1}` };

      const batterName = batterObj.name;
      const bowlerName = bowlerObj.name;

      const rand = Math.random();
      let outcomeRuns = 0;
      let isWicket = false;
      let isSix = false;
      let isFour = false;
      let ballText = '';

      let curStriker = strikerIdx1;
      let curNonStriker = nonStrikerIdx1;
      let curNextBatter = nextBatterIdx1;

      if (rand < wicketProb) {
        isWicket = true;
        soundFx.playWicket();
        
        const outBatterName = batterName;
        curStriker = curNextBatter;
        curNextBatter++;
        setStrikerIdx1(curStriker);
        setNextBatterIdx1(curNextBatter);

        const newBatterName = homeSquad[curStriker]?.name || `Batter ${curStriker + 1}`;
        ballText = `WICKET! ${bowlerName} dismisses ${outBatterName}! Clean bowled! 🎳 Next batter ${newBatterName} walks out.`;

      } else if (rand < wicketProb + boundaryProb * 0.4) {
        outcomeRuns = 6;
        isSix = true;
        ballText = `SIX! ${batterName} lofts ${bowlerName} over long-on for a HUGE 6! 🚀`;
        soundFx.playSixHit();
      } else if (rand < wicketProb + boundaryProb) {
        outcomeRuns = 4;
        isFour = true;
        ballText = `FOUR! Beautiful cover drive by ${batterName} off ${bowlerName}! 💥`;
        soundFx.playSixHit();
      } else {
        outcomeRuns = Math.floor(Math.random() * 3);
        ballText = outcomeRuns === 0 ? `Dot ball. ${bowlerName} bowls tight line to ${batterName}.` : `${outcomeRuns} run(s) taken by ${batterName}.`;
      }

      // Update Home Batter Stats
      setHomeStats((prev) => {
        const cur = prev[strikerIdx1] || { name: batterName, teamName: homeTeam.name, teamFlag: homeTeam.flagUrl, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, wickets: 0, bowlerRuns: 0, bowlerBalls: 0 };
        return {
          ...prev,
          [strikerIdx1]: {
            ...cur,
            runs: cur.runs + outcomeRuns,
            balls: cur.balls + 1,
            fours: cur.fours + (isFour ? 1 : 0),
            sixes: cur.sixes + (isSix ? 1 : 0),
            isOut: isWicket ? true : cur.isOut
          }
        };
      });

      // Update Away Bowler Stats
      setAwayStats((prev) => {
        const cur = prev[bowlerIdx1] || { name: bowlerName, teamName: awayTeam.name, teamFlag: awayTeam.flagUrl, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, wickets: 0, bowlerRuns: 0, bowlerBalls: 0 };
        return {
          ...prev,
          [bowlerIdx1]: {
            ...cur,
            bowlerRuns: cur.bowlerRuns + outcomeRuns,
            bowlerBalls: cur.bowlerBalls + 1,
            wickets: cur.wickets + (isWicket ? 1 : 0)
          }
        };
      });

      // Rotate strike on odd runs (1, 3)
      if (!isWicket && (outcomeRuns === 1 || outcomeRuns === 3)) {
        setStrikerIdx1(curNonStriker);
        setNonStrikerIdx1(curStriker);
      }

      // End of over: rotate strike & change bowler
      if (ballInOver === 6) {
        if (!isWicket && outcomeRuns !== 1 && outcomeRuns !== 3) {
          setStrikerIdx1(curNonStriker);
          setNonStrikerIdx1(curStriker);
        }
        const nextBowler = 7 + (overNum % 4);
        setBowlerIdx1(nextBowler);
      }

      const newRuns = homeScore.runs + outcomeRuns;
      const newWickets = isWicket ? homeScore.wickets + 1 : homeScore.wickets;

      setHomeScore({ runs: newRuns, wickets: newWickets });
      setBallsHistory((prev) => [
        { innings: 1, ballNum: ballLabel, text: `[${homeTeam.name}] ${ballText}`, runs: outcomeRuns, isWicket, isSix, isFour },
        ...prev
      ]);
      setBallIndex1((prev) => prev + 1);

      if (ballIndex1 + 1 >= 30 || newWickets >= 10) {
        setCurrentInnings(2);
        setMatchStatus('INNINGS_2');
      }
    }

    // --- INNINGS 2 (Away Team Bats 5 Overs Chasing Target) ---
    else if (currentInnings === 2) {
      setMatchStatus('INNINGS_2');
      const target = homeScore.runs + 1;

      if (awayScore.runs >= target || ballIndex2 >= 30 || awayScore.wickets >= 10) {
        finishMatch(homeScore, awayScore, homeTeam, awayTeam);
        return;
      }

      const overNum = Math.floor(ballIndex2 / 6) + 1;
      const ballInOver = (ballIndex2 % 6) + 1;
      const ballLabel = `${overNum}.${ballInOver}`;

      const batterObj = awaySquad[strikerIdx2] || { name: `Batter ${strikerIdx2 + 1}` };
      const bowlerObj = homeSquad[bowlerIdx2] || { name: `Bowler ${bowlerIdx2 + 1}` };

      const batterName = batterObj.name;
      const bowlerName = bowlerObj.name;

      const rand = Math.random();
      let outcomeRuns = 0;
      let isWicket = false;
      let isSix = false;
      let isFour = false;
      let ballText = '';

      let curStriker = strikerIdx2;
      let curNonStriker = nonStrikerIdx2;
      let curNextBatter = nextBatterIdx2;

      if (rand < wicketProb) {
        isWicket = true;
        soundFx.playWicket();

        const outBatterName = batterName;
        curStriker = curNextBatter;
        curNextBatter++;
        setStrikerIdx2(curStriker);
        setNextBatterIdx2(curNextBatter);

        const newBatterName = awaySquad[curStriker]?.name || `Batter ${curStriker + 1}`;
        ballText = `WICKET! ${bowlerName} dismisses ${outBatterName}! Clean bowled! 🎳 Next batter ${newBatterName} walks out.`;

      } else if (rand < wicketProb + boundaryProb * 0.4) {
        outcomeRuns = 6;
        isSix = true;
        ballText = `SIX! ${batterName} smashes ${bowlerName} over long-on for 6! 🚀`;
        soundFx.playSixHit();
      } else if (rand < wicketProb + boundaryProb) {
        outcomeRuns = 4;
        isFour = true;
        ballText = `FOUR! Crack off the bat by ${batterName} against ${bowlerName}! 💥`;
        soundFx.playSixHit();
      } else {
        outcomeRuns = Math.floor(Math.random() * 3);
        ballText = outcomeRuns === 0 ? `Dot ball. ${bowlerName} bowls tight to ${batterName}.` : `${outcomeRuns} run(s) taken by ${batterName}.`;
      }

      // Update Away Batter Stats
      setAwayStats((prev) => {
        const cur = prev[strikerIdx2] || { name: batterName, teamName: awayTeam.name, teamFlag: awayTeam.flagUrl, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, wickets: 0, bowlerRuns: 0, bowlerBalls: 0 };
        return {
          ...prev,
          [strikerIdx2]: {
            ...cur,
            runs: cur.runs + outcomeRuns,
            balls: cur.balls + 1,
            fours: cur.fours + (isFour ? 1 : 0),
            sixes: cur.sixes + (isSix ? 1 : 0),
            isOut: isWicket ? true : cur.isOut
          }
        };
      });

      // Update Home Bowler Stats
      setHomeStats((prev) => {
        const cur = prev[bowlerIdx2] || { name: bowlerName, teamName: homeTeam.name, teamFlag: homeTeam.flagUrl, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false, wickets: 0, bowlerRuns: 0, bowlerBalls: 0 };
        return {
          ...prev,
          [bowlerIdx2]: {
            ...cur,
            bowlerRuns: cur.bowlerRuns + outcomeRuns,
            bowlerBalls: cur.bowlerBalls + 1,
            wickets: cur.wickets + (isWicket ? 1 : 0)
          }
        };
      });

      // Rotate strike on odd runs (1, 3)
      if (!isWicket && (outcomeRuns === 1 || outcomeRuns === 3)) {
        setStrikerIdx2(curNonStriker);
        setNonStrikerIdx2(curStriker);
      }

      // End of over: rotate strike & change bowler
      if (ballInOver === 6) {
        if (!isWicket && outcomeRuns !== 1 && outcomeRuns !== 3) {
          setStrikerIdx2(curNonStriker);
          setNonStrikerIdx2(curStriker);
        }
        const nextBowler = 7 + (overNum % 4);
        setBowlerIdx2(nextBowler);
      }

      const newRuns = awayScore.runs + outcomeRuns;
      const newWickets = isWicket ? awayScore.wickets + 1 : awayScore.wickets;

      setAwayScore({ runs: newRuns, wickets: newWickets });
      setBallsHistory((prev) => [
        { innings: 2, ballNum: ballLabel, text: `[${awayTeam.name}] ${ballText}`, runs: outcomeRuns, isWicket, isSix, isFour },
        ...prev
      ]);
      setBallIndex2((prev) => prev + 1);

      if (newRuns >= target || ballIndex2 + 1 >= 30 || newWickets >= 10) {
        finishMatch(homeScore, { runs: newRuns, wickets: newWickets }, homeTeam, awayTeam);
      }
    }
  };

  const finishMatch = (
    hScore: { runs: number; wickets: number },
    aScore: { runs: number; wickets: number },
    hTeam: Country,
    aTeam: Country
  ) => {
    setIsPlaying(false);
    setMatchStatus('FINISHED');
    soundFx.playFanfare();

    if (aScore.runs > hScore.runs) {
      const wktsLeft = 10 - aScore.wickets;
      setWinnerMessage(`🏆 ${aTeam.name} won by ${wktsLeft} wicket(s)!`);
    } else if (hScore.runs > aScore.runs) {
      const margin = hScore.runs - aScore.runs;
      setWinnerMessage(`🏆 ${hTeam.name} won by ${margin} run(s)!`);
    } else {
      setWinnerMessage(`⚡ MATCH TIED! Match goes to Super Over!`);
    }
  };

  const handleTogglePlay = () => {
    if (matchStatus === 'FINISHED') {
      resetMatch();
      setTimeout(() => setIsPlaying(true), 50);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Compute Top 3 Batters & Top 3 Bowlers across match
  const allBattersList = [...Object.values(homeStats), ...Object.values(awayStats)];
  const top3Batters = allBattersList
    .filter(b => b.balls > 0)
    .sort((a, b) => b.runs - a.runs)
    .slice(0, 3);

  const allBowlersList = [...Object.values(homeStats), ...Object.values(awayStats)];
  const top3Bowlers = allBowlersList
    .filter(b => b.bowlerBalls > 0)
    .sort((a, b) => b.wickets - a.wickets || a.bowlerRuns - b.bowlerRuns)
    .slice(0, 3);

  if (!isOpen || !homeTeam || !awayTeam) return null;

  const currentStrikerStat = currentInnings === 1 ? homeStats[strikerIdx1] : awayStats[strikerIdx2];
  const currentNonStrikerStat = currentInnings === 1 ? homeStats[nonStrikerIdx1] : awayStats[nonStrikerIdx2];
  const currentBowlerStat = currentInnings === 1 ? awayStats[bowlerIdx1] : homeStats[bowlerIdx2];

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[2px]">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-emerald-400">
                  <Zap className="w-5 h-5" />
                </div>
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Full 5-Over 2-Innings Live T5 Match Simulator</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Live Batter Runs (Balls) • Bowler Wickets (Runs) • Top 3 Performers
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700"
              title="Close Live Simulator"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="overflow-y-auto pr-1 space-y-5 pt-3 flex-1 scrollbar-thin">

            {/* Team Pickers */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Team 1 (Batting 1st)</label>
                <select
                  value={homeTeam.id}
                  onChange={(e) => {
                    const c = allCountries.find(x => x.id === e.target.value);
                    if (c) setHomeTeam(c);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                >
                  {allCountries.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Team 2 (Chasing 2nd)</label>
                <select
                  value={awayTeam.id}
                  onChange={(e) => {
                    const c = allCountries.find(x => x.id === e.target.value);
                    if (c) setAwayTeam(c);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200 focus:outline-none"
                >
                  {allCountries.map(c => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Live Score Ticker Board (Both Teams Scores) */}
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-3 shadow-lg">
              
              {/* Score Display Banner */}
              <div className="grid grid-cols-2 gap-3">
                {/* Team 1 Score */}
                <div className={`p-3 rounded-xl border transition ${currentInnings === 1 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-center justify-center space-x-1.5 mb-1">
                    <img src={homeTeam.flagUrl} alt="" className="w-5 h-3.5 rounded object-cover" />
                    <span className="text-xs truncate">{homeTeam.name}</span>
                    {currentInnings === 1 && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div className="font-mono font-black text-2xl text-emerald-400">
                    {homeScore.runs} / {homeScore.wickets}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ({(ballIndex1 / 6).toFixed(1)} / 5.0 ov)
                  </div>
                </div>

                {/* Team 2 Score */}
                <div className={`p-3 rounded-xl border transition ${currentInnings === 2 ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-300'}`}>
                  <div className="flex items-center justify-center space-x-1.5 mb-1">
                    <img src={awayTeam.flagUrl} alt="" className="w-5 h-3.5 rounded object-cover" />
                    <span className="text-xs truncate">{awayTeam.name}</span>
                    {currentInnings === 2 && matchStatus !== 'FINISHED' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                  </div>
                  <div className="font-mono font-black text-2xl text-emerald-400">
                    {awayScore.runs} / {awayScore.wickets}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    ({(ballIndex2 / 6).toFixed(1)} / 5.0 ov)
                    {currentInnings === 2 && matchStatus !== 'FINISHED' && (
                      <span className="text-amber-400 font-bold block">Target: {homeScore.runs + 1}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Active Crease Status Bar with Batter Runs & Bowler Wickets */}
              {matchStatus !== 'NOT_STARTED' && matchStatus !== 'FINISHED' && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 grid grid-cols-3 gap-2 text-[11px] font-mono">
                  {/* Striker */}
                  <div className="text-left bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block">⚡ Striker</span>
                    <span className="font-bold text-slate-100 truncate block">
                      {currentStrikerStat ? currentStrikerStat.name : 'Batter'} *
                    </span>
                    <span className="text-[10px] text-emerald-300 font-bold block">
                      {currentStrikerStat ? `${currentStrikerStat.runs} (${currentStrikerStat.balls}b)` : '0 (0b)'}
                    </span>
                  </div>

                  {/* Non-Striker */}
                  <div className="text-left bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">🏏 Non-Striker</span>
                    <span className="font-bold text-slate-300 truncate block">
                      {currentNonStrikerStat ? currentNonStrikerStat.name : 'Batter'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {currentNonStrikerStat ? `${currentNonStrikerStat.runs} (${currentNonStrikerStat.balls}b)` : '0 (0b)'}
                    </span>
                  </div>

                  {/* Bowler */}
                  <div className="text-left bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-purple-400 block">⚾ Bowler</span>
                    <span className="font-bold text-slate-300 truncate block">
                      {currentBowlerStat ? currentBowlerStat.name : 'Bowler'}
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold block">
                      {currentBowlerStat ? `${currentBowlerStat.wickets}/${currentBowlerStat.bowlerRuns} (${(currentBowlerStat.bowlerBalls / 6).toFixed(1)}ov)` : '0/0 (0.0ov)'}
                    </span>
                  </div>
                </div>
              )}

              {/* Match Winner Announcement Banner */}
              {winnerMessage && (
                <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/50 rounded-xl p-3 text-amber-300 font-extrabold text-sm shadow animate-pulse">
                  {winnerMessage}
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-center space-x-3 pt-1">
                <button
                  onClick={handleTogglePlay}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2 transition shadow-md ${
                    isPlaying
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                      : matchStatus === 'FINISHED'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 hover:scale-105'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : matchStatus === 'FINISHED' ? (
                    <RotateCcw className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>
                    {isPlaying
                      ? 'Pause Live'
                      : matchStatus === 'FINISHED'
                      ? 'Restart T5 Match 🔄'
                      : matchStatus === 'NOT_STARTED'
                      ? 'Play 5-Over T5 Match Live'
                      : 'Resume Live Play'}
                  </span>
                </button>

                <button
                  onClick={simulateNextBall}
                  disabled={isPlaying || matchStatus === 'FINISHED'}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  Step 1 Ball
                </button>

                <button
                  onClick={resetMatch}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition border border-slate-700"
                  title="Reset Live T5 Match"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TOP 3 BATTERS & TOP 3 BOWLERS SUMMARY CARD (Shown on Match Finish) */}
            {matchStatus === 'FINISHED' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 space-y-4 shadow-xl font-mono text-xs"
              >
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                    🏆 Match Summary Scorecard Leaderboard
                  </span>
                  <h3 className="text-sm font-extrabold text-white">Top 3 Batters & Top 3 Bowlers</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  {/* Top 3 Batters */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-[11px]">
                      <Flame className="w-3.5 h-3.5" />
                      <span>Top 3 Batters</span>
                    </div>

                    <div className="space-y-1.5">
                      {top3Batters.map((b, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950/70 p-2 rounded-lg text-[11px] border border-slate-800/80">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-slate-500 font-bold">{idx + 1}.</span>
                            {b.teamFlag && <img src={b.teamFlag} alt="" className="w-4 h-3 object-cover rounded flex-shrink-0" />}
                            <span className="font-bold text-slate-200 truncate">{b.name}</span>
                          </div>
                          <span className="text-emerald-400 font-bold flex-shrink-0">
                            {b.runs} ({b.balls}b) {b.sixes > 0 && `• ${b.sixes}x6`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top 3 Bowlers */}
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center space-x-2 text-purple-400 font-bold text-[11px]">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Top 3 Bowlers</span>
                    </div>

                    <div className="space-y-1.5">
                      {top3Bowlers.map((b, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-950/70 p-2 rounded-lg text-[11px] border border-slate-800/80">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span className="text-slate-500 font-bold">{idx + 1}.</span>
                            {b.teamFlag && <img src={b.teamFlag} alt="" className="w-4 h-3 object-cover rounded flex-shrink-0" />}
                            <span className="font-bold text-slate-200 truncate">{b.name}</span>
                          </div>
                          <span className="text-purple-400 font-bold flex-shrink-0">
                            {b.wickets}/{b.bowlerRuns} ({(b.bowlerBalls / 6).toFixed(1)}ov)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Live Ticker Feed */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                🎙️ Full Match Commentary Ticker Feed (Innings 1 & 2)
              </span>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {ballsHistory.length > 0 ? (
                  ballsHistory.map((b, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start space-x-2 p-2 rounded-xl border text-xs ${
                        b.isWicket
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                          : b.isSix
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                          : b.isFour
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-slate-900 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <span className="font-bold font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 flex-shrink-0 text-[10px]">
                        Inn {b.innings} • {b.ballNum}
                      </span>
                      <span className="flex-1 leading-snug">{b.text}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-4">Click Play to start live 5-Over 2-Innings T5 Match!</p>
                )}
              </div>
            </div>

            <div className="pt-1 text-center text-[10px] text-amber-400/70 font-mono pb-2">
              ⚠️ Disclaimer: Live ball-by-ball events, player names, and scores are procedurally simulated for tournament play and may be incorrect or fictional.
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

