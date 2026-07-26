import React, { useState, useEffect } from 'react';
import { Country, PitchType } from '../types/cricket';
import { useCricketStore } from '../store/useCricketStore';
import { getFullPlayingXI, CricketPlayerProfile } from '../engine/cricketPlayerNames';
import { soundFx } from '../utils/soundFx';
import { X, Play, Pause, RotateCcw, Zap, Flame, Shield, Trophy, Award, Search, ChevronRight, FileText, BarChart2, Sun, Moon, CloudRain, Wand2, Sparkles, Mic, MicOff, Volume2, VolumeX, Tv } from 'lucide-react';
import { generateTVCommentary, speakTVCommentary, setVoiceMuted } from '../utils/cricketCommentary';
import { DrsReviewModal, DrsReviewData } from './DrsReviewModal';
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

// Format cricket over notation: 6 balls max per over (e.g. 0.1, 0.2, 0.3, 0.4, 0.5, 1.0)
const formatOvers = (totalBalls: number): string => {
  const overs = Math.floor(totalBalls / 6);
  const balls = totalBalls % 6;
  return `${overs}.${balls}`;
};

// Searchable Country Dropdown Component for Cricket Teams
const SearchableCountrySelect: React.FC<{
  selectedCountry: Country;
  onSelect: (c: Country) => void;
  label: string;
  allCountries: Country[];
}> = ({ selectedCountry, onSelect, label, allCountries }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = allCountries.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.region.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-left flex items-center justify-between text-slate-200 text-xs font-bold focus:outline-none hover:border-slate-700 transition"
      >
        <span className="truncate flex items-center space-x-1.5">
          <span>{selectedCountry.emoji}</span>
          <span>{selectedCountry.name}</span>
        </span>
        <span className="text-[10px] text-emerald-400 font-mono">🔍 Search</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 space-y-2 flex flex-col">
          <input
            type="text"
            placeholder="Type country name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
            autoFocus
          />
          <div className="overflow-y-auto max-h-44 space-y-0.5 pr-1 scrollbar-thin">
            {filtered.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onSelect(c);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full text-left p-1.5 rounded-lg text-xs flex items-center space-x-2 transition ${
                  c.id === selectedCountry.id ? 'bg-emerald-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-200'
                }`}
              >
                <span>{c.emoji}</span>
                <span className="truncate">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const LiveMatchSimulatorModal: React.FC<LiveMatchSimulatorModalProps> = ({ isOpen, onClose }) => {
  const { allCountries, pitchType } = useCricketStore();

  const [homeTeam, setHomeTeam] = useState<Country>(allCountries[0] || null);
  const [awayTeam, setAwayTeam] = useState<Country>(allCountries[1] || null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentInnings, setCurrentInnings] = useState<1 | 2 | 3 | 4>(1);
  const [ballIndex1, setBallIndex1] = useState(0); // 0 to 30 (5 overs)
  const [ballIndex2, setBallIndex2] = useState(0); // 0 to 30 (5 overs)

  const [homeScore, setHomeScore] = useState({ runs: 0, wickets: 0 });
  const [awayScore, setAwayScore] = useState({ runs: 0, wickets: 0 });

  const [showFullScorecard, setShowFullScorecard] = useState(false);
  const [scorecardTab, setScorecardTab] = useState<1 | 2>(1);

  // Stadium Weather & Fun Atmosphere Mode
  const [stadiumAtmosphere, setStadiumAtmosphere] = useState<'NIGHT_FLOODLIGHTS' | 'SUNNY' | 'RAIN_DEW' | 'DUST_BOWL'>('NIGHT_FLOODLIGHTS');
  
  // Tactical Dugout Boosters
  const [activeTacticalBooster, setActiveTacticalBooster] = useState<'POWER_HIT' | 'YORKER' | 'MYSTERY_SPIN' | null>(null);
  const [boosterCount, setBoosterCount] = useState({ powerHits: 2, yorkers: 2, spins: 2 });
  const [ledRopeGlow, setLedRopeGlow] = useState<'SIX' | 'FOUR' | 'WICKET' | 'DEFAULT'>('DEFAULT');

  // Real-Time Browser Voice Commentary (TTS)
  const [isVoiceCommentaryOn, setIsVoiceCommentaryOn] = useState(true);

  // TV DRS Decision Review System State
  const [isDrsOpen, setIsDrsOpen] = useState(false);
  const [drsReviewData, setDrsReviewData] = useState<DrsReviewData | null>(null);

  const triggerDrsReview = () => {
    const curBatter = currentInnings === 1 ? homeSquad[strikerIdx1]?.name || 'Batter' : awaySquad[strikerIdx2]?.name || 'Batter';
    const curBowler = currentInnings === 1 ? awaySquad[bowlerIdx1]?.name || 'Bowler' : homeSquad[bowlerIdx2]?.name || 'Bowler';
    const isLBW = Math.random() > 0.4;
    const isOut = Math.random() > 0.45;

    setDrsReviewData({
      batterName: curBatter,
      bowlerName: curBowler,
      reviewType: isLBW ? 'LBW' : 'CATCH',
      originalDecision: isOut ? 'OUT' : 'NOT_OUT',
      finalDecision: isOut ? 'OUT' : 'NOT_OUT',
      pitching: isOut ? 'IN_LINE' : 'OUTSIDE_STUMPS',
      impact: isOut ? 'IN_LINE' : 'OUTSIDE_OFF',
      wickets: isOut ? 'HITTING' : 'MISSING',
      hasEdgeSpike: !isLBW && isOut
    });
    setIsDrsOpen(true);
  };

  // Squad Roster & Active Crease State
  const [homeSquad, setHomeSquad] = useState<CricketPlayerProfile[]>([]);
  const [awaySquad, setAwaySquad] = useState<CricketPlayerProfile[]>([]);

  // Detailed Stats Maps
  const [homeStats, setHomeStats] = useState<Record<number, LivePlayerStat>>({});
  const [awayStats, setAwayStats] = useState<Record<number, LivePlayerStat>>({});

  // Innings 1 Crease Tracking
  const [strikerIdx1, setStrikerIdx1] = useState(0);
  const [nonStrikerIdx1, setNonStrikerIdx1] = useState(1);
  const [nextBatterIdx1, setNextBatterIdx1] = useState(2);
  const [bowlerIdx1, setBowlerIdx1] = useState(7);

  // Innings 2 Crease Tracking
  const [strikerIdx2, setStrikerIdx2] = useState(0);
  const [nonStrikerIdx2, setNonStrikerIdx2] = useState(1);
  const [nextBatterIdx2, setNextBatterIdx2] = useState(2);
  const [bowlerIdx2, setBowlerIdx2] = useState(7);

  const [matchStatus, setMatchStatus] = useState<'NOT_STARTED' | 'INNINGS_1' | 'INNINGS_BREAK' | 'INNINGS_2' | 'SUPER_OVER_1' | 'SUPER_OVER_2' | 'FINISHED'>('NOT_STARTED');
  const [winnerMessage, setWinnerMessage] = useState<string>('');

  // Super Over Sudden Death State
  const [superOverHomeScore, setSuperOverHomeScore] = useState({ runs: 0, wickets: 0 });
  const [superOverAwayScore, setSuperOverAwayScore] = useState({ runs: 0, wickets: 0 });
  const [ballIndexSO1, setBallIndexSO1] = useState(0); // 0 to 6
  const [ballIndexSO2, setBallIndexSO2] = useState(0); // 0 to 6

  const [ballsHistory, setBallsHistory] = useState<Array<{ innings: 1 | 2 | 3 | 4; ballNum: string; text: string; runs: number; isWicket?: boolean; isSix?: boolean; isFour?: boolean }>>([]);

  // 2D Cricket Stadium Pitch Animation State
  const [ballPos, setBallPos] = useState<{ x: number; y: number }>({ x: 50, y: 78 });
  const [bowlerPos, setBowlerPos] = useState<{ x: number; y: number }>({ x: 50, y: 12 });
  const [batterPos, setBatterPos] = useState<{ x: number; y: number }>({ x: 48, y: 78 });
  const [lastEventOverlay, setLastEventOverlay] = useState<string | null>(null);
  const [isWicketStumpsLit, setIsWicketStumpsLit] = useState(false);

  // 8 Outfield Fielder Positions around boundary
  const [fieldersPos, setFieldersPos] = useState<Array<{ x: number; y: number }>>([
    { x: 18, y: 25 }, { x: 50, y: 8 }, { x: 82, y: 25 }, // Long Off, Long On, Third Man
    { x: 15, y: 60 }, { x: 85, y: 60 },                 // Deep Cover, Deep Mid-Wicket
    { x: 22, y: 82 }, { x: 50, y: 92 }, { x: 78, y: 82 }  // Fine Leg, Deep Backward Square, Deep Point
  ]);

  useEffect(() => {
    if (!homeTeam && allCountries.length > 0) setHomeTeam(allCountries[0]);
    if (!awayTeam && allCountries.length > 1) setAwayTeam(allCountries[1]);
  }, [allCountries]);

  // Generate squads & init stats maps when teams change
  useEffect(() => {
    if (homeTeam && awayTeam) {
      const hSquad = getFullPlayingXI(homeTeam.name || homeTeam.id, homeTeam.region);
      const aSquad = getFullPlayingXI(awayTeam.name || awayTeam.id, awayTeam.region);
      setHomeSquad(hSquad);
      setAwaySquad(aSquad);
      resetMatch(hSquad, aSquad);
    }
  }, [homeTeam?.id, homeTeam?.name, awayTeam?.id, awayTeam?.name]);

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
      }, 750);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentInnings, ballIndex1, ballIndex2, ballIndexSO1, ballIndexSO2, matchStatus, homeScore, awayScore, superOverHomeScore, superOverAwayScore]);

  const resetMatch = (hSquadToUse?: CricketPlayerProfile[], aSquadToUse?: CricketPlayerProfile[]) => {
    setIsPlaying(false);
    setCurrentInnings(1);
    setBallIndex1(0);
    setBallIndex2(0);
    setBallIndexSO1(0);
    setBallIndexSO2(0);
    setHomeScore({ runs: 0, wickets: 0 });
    setAwayScore({ runs: 0, wickets: 0 });
    setSuperOverHomeScore({ runs: 0, wickets: 0 });
    setSuperOverAwayScore({ runs: 0, wickets: 0 });

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

    setBallPos({ x: 50, y: 78 });
    setBowlerPos({ x: 50, y: 12 });
    setBatterPos({ x: 48, y: 78 });
    setLastEventOverlay(null);
    setIsWicketStumpsLit(false);
  };

  // Animate 2D Cricket Stadium Pitch Ball Trajectory & Fielder Movement
  const animateCricket2DBallTrajectory = (outcomeType: 'SIX' | 'FOUR' | 'WICKET' | 'RUNS' | 'DOT', runs: number) => {
    setIsWicketStumpsLit(false);

    // 1. Bowler Runs up from {50, 12} to Bowling Crease {50, 24}
    setBowlerPos({ x: 50, y: 24 });
    setBallPos({ x: 50, y: 24 });

    // 2. Ball Delivery & Bounce at pitch center {50, 52}
    setTimeout(() => {
      setBallPos({ x: 50, y: 54 });
    }, 120);

    // 3. Batter stroke contact at {48, 78}
    setTimeout(() => {
      setBallPos({ x: 48, y: 78 });
    }, 240);

    // 4. Ball Outfield Trajectory according to outcome
    setTimeout(() => {
      if (outcomeType === 'SIX') {
        const targetX = Math.random() < 0.5 ? 90 : 10;
        const targetY = Math.random() < 0.5 ? 8 : 92;
        setBallPos({ x: targetX, y: targetY });
        setLastEventOverlay('6️⃣ HUGE SIX!');
        setLedRopeGlow('SIX');
        soundFx.playSixHit();
        soundFx.playCheer();
      } else if (outcomeType === 'FOUR') {
        const targetX = Math.random() < 0.5 ? 85 : 15;
        const targetY = Math.random() < 0.5 ? 20 : 80;
        setBallPos({ x: targetX, y: targetY });
        setLastEventOverlay('4️⃣ FOUR!');
        setLedRopeGlow('FOUR');
        soundFx.playSixHit();
        soundFx.playCheer();
      } else if (outcomeType === 'WICKET') {
        setBallPos({ x: 50, y: 82 }); // Hits stumps
        setIsWicketStumpsLit(true);
        setLedRopeGlow('WICKET');
        setLastEventOverlay('🎳 OUT / WICKET!');
        soundFx.playWicket();
      } else if (runs > 0) {
        const targetX = Math.random() < 0.5 ? 65 : 35;
        const targetY = Math.random() < 0.5 ? 45 : 55;
        setBallPos({ x: targetX, y: targetY });
        setLastEventOverlay(`${runs} RUN${runs > 1 ? 'S' : ''}`);
        setLedRopeGlow('DEFAULT');

        // Fielders slide towards ball
        setFieldersPos(prev => prev.map((f, i) => i === 2 ? { x: targetX - 4, y: targetY - 4 } : f));
      } else {
        setBallPos({ x: 48, y: 76 });
        setLastEventOverlay('⚪ DOT BALL');
        setLedRopeGlow('DEFAULT');
      }
    }, 360);

    // Reset Bowler to run-up start & clear LED rope glow
    setTimeout(() => {
      setBowlerPos({ x: 50, y: 12 });
      setLedRopeGlow('DEFAULT');
    }, 850);
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

      const boosterUsed = activeTacticalBooster;

      if (activeTacticalBooster === 'POWER_HIT') {
        outcomeRuns = 6;
        isSix = true;
        animateCricket2DBallTrajectory('SIX', 6);
        setActiveTacticalBooster(null);
      } else if (activeTacticalBooster === 'YORKER') {
        isWicket = true;
        animateCricket2DBallTrajectory('WICKET', 0);
        curStriker = curNextBatter;
        curNextBatter++;
        setStrikerIdx1(curStriker);
        setNextBatterIdx1(curNextBatter);
        setActiveTacticalBooster(null);
      } else if (activeTacticalBooster === 'MYSTERY_SPIN') {
        outcomeRuns = 0;
        animateCricket2DBallTrajectory('DOT', 0);
        setActiveTacticalBooster(null);
      } else if (rand < wicketProb) {
        isWicket = true;
        animateCricket2DBallTrajectory('WICKET', 0);
        curStriker = curNextBatter;
        curNextBatter++;
        setStrikerIdx1(curStriker);
        setNextBatterIdx1(curNextBatter);

        // 28% chance on a Wicket delivery to trigger automatic DRS Review scenario!
        if (Math.random() < 0.28) {
          const isOverturned = Math.random() < 0.55;
          const isLBW = Math.random() > 0.5;

          setDrsReviewData({
            batterName,
            bowlerName,
            reviewType: isLBW ? 'LBW' : 'CATCH',
            originalDecision: 'OUT',
            finalDecision: isOverturned ? 'NOT_OUT' : 'OUT',
            pitching: isOverturned ? 'IN_LINE' : 'IN_LINE',
            impact: isOverturned ? 'OUTSIDE_OFF' : 'IN_LINE',
            wickets: isOverturned ? 'MISSING' : 'HITTING',
            hasEdgeSpike: !isLBW && !isOverturned
          });
          setIsDrsOpen(true);

          if (isOverturned) {
            isWicket = false;
            outcomeRuns = 0;
            setStrikerIdx1(strikerIdx1);
            setNextBatterIdx1(nextBatterIdx1);
          }
        }
      } else if (rand < wicketProb + boundaryProb * 0.4) {
        outcomeRuns = 6;
        isSix = true;
        animateCricket2DBallTrajectory('SIX', 6);
      } else if (rand < wicketProb + boundaryProb) {
        outcomeRuns = 4;
        isFour = true;
        animateCricket2DBallTrajectory('FOUR', 4);
      } else {
        outcomeRuns = Math.floor(Math.random() * 3);
        animateCricket2DBallTrajectory(outcomeRuns > 0 ? 'RUNS' : 'DOT', outcomeRuns);
      }

      const outcomeType = isWicket ? 'WICKET' : isSix ? 'SIX' : isFour ? 'FOUR' : outcomeRuns === 0 ? 'DOT' : 'RUNS';
      const comm = generateTVCommentary({
        batterName,
        bowlerName,
        outcomeType,
        runs: outcomeRuns,
        boosterName: boosterUsed
      });

      ballText = comm.fullText;
      if (isVoiceCommentaryOn) {
        speakTVCommentary(comm.voicePhrase);
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
            wickets: cur.wickets + (isWicket ? 1 : 0),
            bowlerRuns: cur.bowlerRuns + outcomeRuns,
            bowlerBalls: cur.bowlerBalls + 1
          }
        };
      });

      // Strike Rotation on odd runs (1 or 3)
      if (outcomeRuns % 2 !== 0 && !isWicket) {
        const temp = curStriker;
        setStrikerIdx1(curNonStriker);
        setNonStrikerIdx1(temp);
      }

      // Over completion (change bowler every 6 balls)
      if (ballInOver === 6) {
        setBowlerIdx1((prev) => (prev + 1 < awaySquad.length ? prev + 1 : 7));
        const temp = curStriker;
        setStrikerIdx1(curNonStriker);
        setNonStrikerIdx1(temp);
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
        soundFx.playSuperOver();
      }
    }
    // --- INNINGS 2 (Away Team Chases) ---
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

      const boosterUsed = activeTacticalBooster;

      if (activeTacticalBooster === 'POWER_HIT') {
        outcomeRuns = 6;
        isSix = true;
        animateCricket2DBallTrajectory('SIX', 6);
        setActiveTacticalBooster(null);
      } else if (activeTacticalBooster === 'YORKER') {
        isWicket = true;
        animateCricket2DBallTrajectory('WICKET', 0);
        curStriker = curNextBatter;
        curNextBatter++;
        setStrikerIdx2(curStriker);
        setNextBatterIdx2(curNextBatter);
        setActiveTacticalBooster(null);
      } else if (activeTacticalBooster === 'MYSTERY_SPIN') {
        outcomeRuns = 0;
        animateCricket2DBallTrajectory('DOT', 0);
        setActiveTacticalBooster(null);
      } else if (rand < wicketProb) {
        isWicket = true;
        animateCricket2DBallTrajectory('WICKET', 0);
        curStriker = curNextBatter;
        curNextBatter++;
        setStrikerIdx2(curStriker);
        setNextBatterIdx2(curNextBatter);

        // 28% chance on a Wicket delivery to trigger automatic DRS Review scenario!
        if (Math.random() < 0.28) {
          const isOverturned = Math.random() < 0.55;
          const isLBW = Math.random() > 0.5;

          setDrsReviewData({
            batterName,
            bowlerName,
            reviewType: isLBW ? 'LBW' : 'CATCH',
            originalDecision: 'OUT',
            finalDecision: isOverturned ? 'NOT_OUT' : 'OUT',
            pitching: isOverturned ? 'IN_LINE' : 'IN_LINE',
            impact: isOverturned ? 'OUTSIDE_OFF' : 'IN_LINE',
            wickets: isOverturned ? 'MISSING' : 'HITTING',
            hasEdgeSpike: !isLBW && !isOverturned
          });
          setIsDrsOpen(true);

          if (isOverturned) {
            isWicket = false;
            outcomeRuns = 0;
            setStrikerIdx2(strikerIdx2);
            setNextBatterIdx2(nextBatterIdx2);
          }
        }
      } else if (rand < wicketProb + boundaryProb * 0.4) {
        outcomeRuns = 6;
        isSix = true;
        animateCricket2DBallTrajectory('SIX', 6);
      } else if (rand < wicketProb + boundaryProb) {
        outcomeRuns = 4;
        isFour = true;
        animateCricket2DBallTrajectory('FOUR', 4);
      } else {
        outcomeRuns = Math.floor(Math.random() * 3);
        animateCricket2DBallTrajectory(outcomeRuns > 0 ? 'RUNS' : 'DOT', outcomeRuns);
      }

      const outcomeType = isWicket ? 'WICKET' : isSix ? 'SIX' : isFour ? 'FOUR' : outcomeRuns === 0 ? 'DOT' : 'RUNS';
      const comm = generateTVCommentary({
        batterName,
        bowlerName,
        outcomeType,
        runs: outcomeRuns,
        boosterName: boosterUsed
      });

      ballText = comm.fullText;
      if (isVoiceCommentaryOn) {
        speakTVCommentary(comm.voicePhrase);
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
            wickets: cur.wickets + (isWicket ? 1 : 0),
            bowlerRuns: cur.bowlerRuns + outcomeRuns,
            bowlerBalls: cur.bowlerBalls + 1
          }
        };
      });

      // Strike Rotation
      if (outcomeRuns % 2 !== 0 && !isWicket) {
        const temp = curStriker;
        setStrikerIdx2(curNonStriker);
        setNonStrikerIdx2(temp);
      }

      // Over completion
      if (ballInOver === 6) {
        setBowlerIdx2((prev) => (prev + 1 < homeSquad.length ? prev + 1 : 7));
        const temp = curStriker;
        setStrikerIdx2(curNonStriker);
        setNonStrikerIdx2(temp);
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
    // --- SUPER OVER 1 (Team 1 Bats 1 Over / 6 Balls) ---
    else if (currentInnings === 3 || matchStatus === 'SUPER_OVER_1') {
      setMatchStatus('SUPER_OVER_1');
      if (ballIndexSO1 >= 6 || superOverHomeScore.wickets >= 2) {
        setCurrentInnings(4);
        setMatchStatus('SUPER_OVER_2');
        soundFx.playSuperOver();
        if (isVoiceCommentaryOn) {
          speakTVCommentary(`Super Over 1 finished! ${homeTeam.name} scored ${superOverHomeScore.runs} runs. Target for ${awayTeam.name} is ${superOverHomeScore.runs + 1}!`);
        }
        return;
      }

      const ballNum = `SO.1.${ballIndexSO1 + 1}`;
      const batterObj = homeSquad[0] || { name: 'Batter 1' };
      const bowlerObj = awaySquad[7] || { name: 'Bowler 1' };

      const batterName = batterObj.name;
      const bowlerName = bowlerObj.name;

      const rand = Math.random();
      let outcomeRuns = 0;
      let isWicket = false;
      let isSix = false;
      let isFour = false;

      const boosterUsed = activeTacticalBooster;
      if (activeTacticalBooster === 'POWER_HIT') {
        outcomeRuns = 6; isSix = true; animateCricket2DBallTrajectory('SIX', 6); setActiveTacticalBooster(null);
      } else if (activeTacticalBooster === 'YORKER') {
        isWicket = true; animateCricket2DBallTrajectory('WICKET', 0); setActiveTacticalBooster(null);
      } else if (activeTacticalBooster === 'MYSTERY_SPIN') {
        outcomeRuns = 0; animateCricket2DBallTrajectory('DOT', 0); setActiveTacticalBooster(null);
      } else if (rand < 0.18) {
        isWicket = true; animateCricket2DBallTrajectory('WICKET', 0);
      } else if (rand < 0.45) {
        outcomeRuns = 6; isSix = true; animateCricket2DBallTrajectory('SIX', 6);
      } else if (rand < 0.75) {
        outcomeRuns = 4; isFour = true; animateCricket2DBallTrajectory('FOUR', 4);
      } else {
        outcomeRuns = Math.floor(Math.random() * 3);
        animateCricket2DBallTrajectory(outcomeRuns > 0 ? 'RUNS' : 'DOT', outcomeRuns);
      }

      const outcomeType = isWicket ? 'WICKET' : isSix ? 'SIX' : isFour ? 'FOUR' : outcomeRuns === 0 ? 'DOT' : 'RUNS';
      const comm = generateTVCommentary({ batterName, bowlerName, outcomeType, runs: outcomeRuns, boosterName: boosterUsed });

      const newRuns = superOverHomeScore.runs + outcomeRuns;
      const newWkts = isWicket ? superOverHomeScore.wickets + 1 : superOverHomeScore.wickets;

      setSuperOverHomeScore({ runs: newRuns, wickets: newWkts });
      setBallsHistory((prev) => [
        { innings: 3, ballNum, text: `⚡ [SUPER OVER - ${homeTeam.name}] ${comm.fullText}`, runs: outcomeRuns, isWicket, isSix, isFour },
        ...prev
      ]);
      setBallIndexSO1((prev) => prev + 1);

      if (isVoiceCommentaryOn) speakTVCommentary(comm.voicePhrase);

      if (ballIndexSO1 + 1 >= 6 || newWkts >= 2) {
        setCurrentInnings(4);
        setMatchStatus('SUPER_OVER_2');
        soundFx.playSuperOver();
      }
    }
    // --- SUPER OVER 2 (Team 2 Chases Super Over Target in 6 Balls) ---
    else if (currentInnings === 4 || matchStatus === 'SUPER_OVER_2') {
      setMatchStatus('SUPER_OVER_2');
      const target = superOverHomeScore.runs + 1;

      if (superOverAwayScore.runs >= target || ballIndexSO2 >= 6 || superOverAwayScore.wickets >= 2) {
        finishSuperOverMatch(superOverAwayScore);
        return;
      }

      const ballNum = `SO.2.${ballIndexSO2 + 1}`;
      const batterObj = awaySquad[0] || { name: 'Batter 1' };
      const bowlerObj = homeSquad[7] || { name: 'Bowler 1' };

      const batterName = batterObj.name;
      const bowlerName = bowlerObj.name;

      const rand = Math.random();
      let outcomeRuns = 0;
      let isWicket = false;
      let isSix = false;
      let isFour = false;

      const boosterUsed = activeTacticalBooster;
      if (activeTacticalBooster === 'POWER_HIT') {
        outcomeRuns = 6; isSix = true; animateCricket2DBallTrajectory('SIX', 6); setActiveTacticalBooster(null);
      } else if (activeTacticalBooster === 'YORKER') {
        isWicket = true; animateCricket2DBallTrajectory('WICKET', 0); setActiveTacticalBooster(null);
      } else if (activeTacticalBooster === 'MYSTERY_SPIN') {
        outcomeRuns = 0; animateCricket2DBallTrajectory('DOT', 0); setActiveTacticalBooster(null);
      } else if (rand < 0.18) {
        isWicket = true; animateCricket2DBallTrajectory('WICKET', 0);
      } else if (rand < 0.45) {
        outcomeRuns = 6; isSix = true; animateCricket2DBallTrajectory('SIX', 6);
      } else if (rand < 0.75) {
        outcomeRuns = 4; isFour = true; animateCricket2DBallTrajectory('FOUR', 4);
      } else {
        outcomeRuns = Math.floor(Math.random() * 3);
        animateCricket2DBallTrajectory(outcomeRuns > 0 ? 'RUNS' : 'DOT', outcomeRuns);
      }

      const outcomeType = isWicket ? 'WICKET' : isSix ? 'SIX' : isFour ? 'FOUR' : outcomeRuns === 0 ? 'DOT' : 'RUNS';
      const comm = generateTVCommentary({ batterName, bowlerName, outcomeType, runs: outcomeRuns, boosterName: boosterUsed });

      const newRuns = superOverAwayScore.runs + outcomeRuns;
      const newWkts = isWicket ? superOverAwayScore.wickets + 1 : superOverAwayScore.wickets;

      setSuperOverAwayScore({ runs: newRuns, wickets: newWkts });
      setBallsHistory((prev) => [
        { innings: 4, ballNum, text: `⚡ [SUPER OVER - ${awayTeam.name}] ${comm.fullText}`, runs: outcomeRuns, isWicket, isSix, isFour },
        ...prev
      ]);
      setBallIndexSO2((prev) => prev + 1);

      if (isVoiceCommentaryOn) speakTVCommentary(comm.voicePhrase);

      if (newRuns >= target || ballIndexSO2 + 1 >= 6 || newWkts >= 2) {
        finishSuperOverMatch({ runs: newRuns, wickets: newWkts });
      }
    }
  };

  const finishSuperOverMatch = (finalSOAwayScore = superOverAwayScore) => {
    setIsPlaying(false);
    setMatchStatus('FINISHED');
    soundFx.playFanfare();

    if (finalSOAwayScore.runs > superOverHomeScore.runs) {
      setWinnerMessage(`🏆 ${awayTeam.name} WON THE SUPER OVER THRILLER! 🎉`);
      if (isVoiceCommentaryOn) speakTVCommentary(`${awayTeam.name} won the Super Over thriller!`);
    } else if (superOverHomeScore.runs > finalSOAwayScore.runs) {
      setWinnerMessage(`🏆 ${homeTeam.name} WON THE SUPER OVER THRILLER! 🎉`);
      if (isVoiceCommentaryOn) speakTVCommentary(`${homeTeam.name} won the Super Over thriller!`);
    } else {
      setWinnerMessage(`🏆 ${homeTeam.name} WON THE SUPER OVER ON BOUNDARY COUNT! 🎉`);
      if (isVoiceCommentaryOn) speakTVCommentary(`Match tied again! ${homeTeam.name} won by boundary count!`);
    }
  };

  const finishMatch = (
    hScore: { runs: number; wickets: number },
    aScore: { runs: number; wickets: number },
    hTeam: Country,
    aTeam: Country
  ) => {
    if (aScore.runs > hScore.runs) {
      setIsPlaying(false);
      setMatchStatus('FINISHED');
      soundFx.playFanfare();
      const wktsLeft = 10 - aScore.wickets;
      setWinnerMessage(`🏆 ${aTeam.name} won by ${wktsLeft} wicket(s)!`);
      if (isVoiceCommentaryOn) speakTVCommentary(`${aTeam.name} won the match!`);
    } else if (hScore.runs > aScore.runs) {
      setIsPlaying(false);
      setMatchStatus('FINISHED');
      soundFx.playFanfare();
      const margin = hScore.runs - aScore.runs;
      setWinnerMessage(`🏆 ${hTeam.name} won by ${margin} run(s)!`);
      if (isVoiceCommentaryOn) speakTVCommentary(`${hTeam.name} won the match!`);
    } else {
      // MATCH TIED! START INTERACTIVE SUPER OVER!
      setMatchStatus('SUPER_OVER_1');
      setCurrentInnings(3);
      soundFx.playSuperOver();
      setWinnerMessage(`⚡ MATCH TIED! Super Over 1-Over Sudden Death Initiated!`);
      if (isVoiceCommentaryOn) {
        speakTVCommentary(`It's a tie! Match goes to Super Over sudden death!`);
      }
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

  const activeInningsBalls = currentInnings === 1 ? ballsHistory.filter(b => b.innings === 1) : ballsHistory.filter(b => b.innings === 2);
  const currentOverBalls = activeInningsBalls.slice(0, 6);

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
                <h2 className="text-base font-extrabold text-white">Full 5-Over 2D Stadium Live Cricket Match Simulator</h2>
                <p className="text-xs text-slate-400 font-mono">
                  Real 2D Pitch Stadium Ball Physics • Bowler Run-up • Batter Striking • TV Scoreboard
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

            {/* Team Pickers with Searchable Select */}
            <div className="grid grid-cols-2 gap-3 bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-xs">
              <SearchableCountrySelect
                selectedCountry={homeTeam}
                onSelect={(c) => setHomeTeam(c)}
                label="Team 1 (Batting 1st)"
                allCountries={allCountries}
              />
              <SearchableCountrySelect
                selectedCountry={awayTeam}
                onSelect={(c) => setAwayTeam(c)}
                label="Team 2 (Chasing 2nd)"
                allCountries={allCountries}
              />
            </div>

            {/* Live Score Ticker Board (Both Teams Scores) */}
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-3 shadow-lg">
              
              {/* SUPER OVER ACTIVE THRILLER BANNER */}
              {(matchStatus === 'SUPER_OVER_1' || matchStatus === 'SUPER_OVER_2') && (
                <div className="bg-gradient-to-r from-amber-500/30 via-orange-500/20 to-amber-500/30 border-2 border-amber-400 p-2.5 rounded-xl text-amber-300 font-extrabold text-xs shadow-xl animate-pulse">
                  ⚡ SUPER OVER SUDDEN DEATH THRILLER! (1 Over • 6 Balls)
                  {matchStatus === 'SUPER_OVER_1' && <span className="block text-[11px] text-white mt-0.5">SO Innings 1: {homeTeam.name} Batting: {superOverHomeScore.runs}/{superOverHomeScore.wickets} ({formatOvers(ballIndexSO1)} / 1.0ov)</span>}
                  {matchStatus === 'SUPER_OVER_2' && <span className="block text-[11px] text-white mt-0.5">SO Innings 2: {awayTeam.name} Chasing Target {superOverHomeScore.runs + 1}: {superOverAwayScore.runs}/{superOverAwayScore.wickets} ({formatOvers(ballIndexSO2)} / 1.0ov)</span>}
                </div>
              )}
              
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
                    ({formatOvers(ballIndex1)} / 5.0 ov)
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
                    ({formatOvers(ballIndex2)} / 5.0 ov)
                    {currentInnings === 2 && matchStatus !== 'FINISHED' && (
                      <span className="text-amber-400 font-bold block">Target: {homeScore.runs + 1}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stadium Weather Atmosphere Selector & Tactical Dugout Boosters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
                {/* Weather Mode Bar */}
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Atmosphere:</span>
                  <button
                    type="button"
                    onClick={() => setStadiumAtmosphere('NIGHT_FLOODLIGHTS')}
                    className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center space-x-1 transition ${
                      stadiumAtmosphere === 'NIGHT_FLOODLIGHTS' ? 'bg-indigo-600 text-white border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                    title="Night Floodlights Match"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Night</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStadiumAtmosphere('SUNNY')}
                    className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center space-x-1 transition ${
                      stadiumAtmosphere === 'SUNNY' ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                    title="Sunny Day Pitch"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sunny</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStadiumAtmosphere('RAIN_DEW')}
                    className={`p-1.5 rounded-lg border text-[11px] font-bold flex items-center space-x-1 transition ${
                      stadiumAtmosphere === 'RAIN_DEW' ? 'bg-cyan-600 text-white border-cyan-400' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                    title="Rainy & Dew Pitch"
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Dew/Rain</span>
                  </button>
                </div>

                {/* Tactical Dugout Cards */}
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase mr-1">Dugout Boosters:</span>
                  <button
                    type="button"
                    disabled={boosterCount.powerHits <= 0 || matchStatus === 'FINISHED'}
                    onClick={() => {
                      if (boosterCount.powerHits > 0) {
                        setActiveTacticalBooster('POWER_HIT');
                        setBoosterCount(p => ({ ...p, powerHits: p.powerHits - 1 }));
                        soundFx.playPowerBoost();
                      }
                    }}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold flex items-center space-x-1 transition shadow ${
                      activeTacticalBooster === 'POWER_HIT'
                        ? 'bg-amber-400 text-slate-950 border-amber-300 animate-pulse'
                        : boosterCount.powerHits > 0
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40 hover:scale-105'
                        : 'bg-slate-900 text-slate-600 border-slate-800 opacity-50'
                    }`}
                  >
                    <span>🚀 Power Hit ({boosterCount.powerHits})</span>
                  </button>

                  <button
                    type="button"
                    disabled={boosterCount.yorkers <= 0 || matchStatus === 'FINISHED'}
                    onClick={() => {
                      if (boosterCount.yorkers > 0) {
                        setActiveTacticalBooster('YORKER');
                        setBoosterCount(p => ({ ...p, yorkers: p.yorkers - 1 }));
                        soundFx.playPowerBoost();
                      }
                    }}
                    className={`px-2 py-1 rounded-lg border text-[10px] font-extrabold flex items-center space-x-1 transition shadow ${
                      activeTacticalBooster === 'YORKER'
                        ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                        : boosterCount.yorkers > 0
                        ? 'bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-300 border-rose-500/40 hover:scale-105'
                        : 'bg-slate-900 text-slate-600 border-slate-800 opacity-50'
                    }`}
                  >
                    <span>🎯 Yorker ({boosterCount.yorkers})</span>
                  </button>
                </div>
              </div>

              {/* 2D REAL CRICKET STADIUM PITCH RADAR */}
              <div className={`relative w-full h-56 sm:h-64 rounded-2xl border-2 overflow-hidden shadow-2xl font-mono select-none my-2 transition-all ${
                ledRopeGlow === 'SIX'
                  ? 'border-amber-400 shadow-amber-500/50 shadow-2xl'
                  : ledRopeGlow === 'FOUR'
                  ? 'border-emerald-400 shadow-emerald-500/50 shadow-2xl'
                  : ledRopeGlow === 'WICKET'
                  ? 'border-rose-500 shadow-rose-500/50 shadow-2xl'
                  : 'border-emerald-500/40'
              } ${
                stadiumAtmosphere === 'SUNNY'
                  ? 'bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-900'
                  : stadiumAtmosphere === 'RAIN_DEW'
                  ? 'bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-950'
                  : 'bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950'
              }`}>
                {/* Outfield Grass Ring & Boundary LED Rope */}
                <div className={`absolute inset-2 border-2 rounded-full pointer-events-none transition ${
                  ledRopeGlow === 'SIX'
                    ? 'border-amber-400 animate-pulse shadow-amber-400 shadow-xl'
                    : ledRopeGlow === 'FOUR'
                    ? 'border-emerald-400 animate-pulse shadow-emerald-400 shadow-xl'
                    : ledRopeGlow === 'WICKET'
                    ? 'border-rose-500 animate-ping shadow-rose-500 shadow-xl'
                    : 'border-dashed border-white/30'
                }`} />
                <div className="absolute inset-8 border border-white/10 rounded-full pointer-events-none" />

                {/* 22-Yard Brown Pitch Strip in Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-36 bg-amber-200/90 border border-amber-400 rounded-sm shadow-inner">
                  {/* Bowling Crease (Top) & Batting Crease (Bottom) */}
                  <div className="absolute top-3 left-0 right-0 h-0.5 bg-slate-900/60" />
                  <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-slate-900/60" />

                  {/* 3 Wicket Stumps (Top - Bowling End) */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
                    <span className="w-1 h-3 bg-amber-800 rounded-xs" />
                    <span className="w-1 h-3 bg-amber-800 rounded-xs" />
                    <span className="w-1 h-3 bg-amber-800 rounded-xs" />
                  </div>

                  {/* 3 Wicket Stumps (Bottom - Batting End) */}
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex space-x-0.5">
                    <span className={`w-1 h-3 rounded-xs transition ${isWicketStumpsLit ? 'bg-rose-500 animate-ping' : 'bg-amber-800'}`} />
                    <span className={`w-1 h-3 rounded-xs transition ${isWicketStumpsLit ? 'bg-rose-500 animate-ping' : 'bg-amber-800'}`} />
                    <span className={`w-1 h-3 rounded-xs transition ${isWicketStumpsLit ? 'bg-rose-500 animate-ping' : 'bg-amber-800'}`} />
                  </div>
                </div>

                {/* 8 Outfield Fielders */}
                {fieldersPos.map((f, i) => (
                  <motion.div
                    key={i}
                    animate={{ left: `${f.x}%`, top: `${f.y}%` }}
                    transition={{ type: 'spring', stiffness: 140, damping: 18 }}
                    className="absolute z-10 w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-blue-600 border border-white text-white rounded-full flex items-center justify-center text-[9px] font-bold shadow"
                  >
                    🚶
                  </motion.div>
                ))}

                {/* Bowler Pin (Runs up to bowl) */}
                <motion.div
                  animate={{ left: `${bowlerPos.x}%`, top: `${bowlerPos.y}%` }}
                  transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                  className="absolute z-20 w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-purple-600 border-2 border-white text-white rounded-full flex items-center justify-center text-xs shadow-lg"
                >
                  🏃
                </motion.div>

                {/* Striker Batter Pin (🏏 at crease) */}
                <motion.div
                  animate={{ left: `${batterPos.x}%`, top: `${batterPos.y}%` }}
                  transition={{ type: 'spring', stiffness: 160, damping: 18 }}
                  className="absolute z-20 w-6 h-6 -translate-x-1/2 -translate-y-1/2 bg-rose-600 border-2 border-white text-white rounded-full flex items-center justify-center text-xs shadow-lg"
                >
                  🏏
                </motion.div>

                {/* Non-Striker Batter Pin */}
                <div
                  className="absolute z-20 w-5 h-5 -translate-x-1/2 -translate-y-1/2 bg-rose-600/80 border border-white text-white rounded-full flex items-center justify-center text-[10px] shadow"
                  style={{ left: '54%', top: '24%' }}
                >
                  🏃
                </div>

                {/* Real-Time Animated Cricket Red Ball */}
                <motion.div
                  animate={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
                  transition={{ type: 'spring', stiffness: 220, damping: 20 }}
                  className="absolute z-30 w-5 h-5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-full h-full rounded-full bg-rose-600 border-2 border-amber-300 shadow-xl flex items-center justify-center text-[10px] animate-pulse">
                    🔴
                  </div>
                </motion.div>

                {/* Boundary / Wicket Event Overlay Banner */}
                {lastEventOverlay && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    key={lastEventOverlay + (currentInnings === 1 ? ballIndex1 : ballIndex2)}
                    className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-amber-400 px-3 py-1 rounded-full text-amber-300 font-extrabold text-xs shadow-2xl z-40"
                  >
                    {lastEventOverlay}
                  </motion.div>
                )}

                {/* Stadium Innings HUD Indicator */}
                <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur border border-slate-800 rounded-lg px-2.5 py-1 text-[10px] font-mono text-emerald-400 z-30 font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>INNINGS {currentInnings} ({currentInnings === 1 ? homeTeam.name : awayTeam.name} Batting)</span>
                </div>
              </div>

              {/* Current Over Balls Timeline Dots */}
              <div className="flex items-center justify-center space-x-2 bg-slate-900/80 p-2 rounded-xl border border-slate-800 font-mono text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase">THIS OVER:</span>
                <div className="flex space-x-1.5">
                  {currentOverBalls.length > 0 ? (
                    currentOverBalls.map((b, i) => (
                      <span
                        key={i}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow ${
                          b.isWicket
                            ? 'bg-rose-600 text-white'
                            : b.isSix
                            ? 'bg-amber-400 text-slate-950'
                            : b.isFour
                            ? 'bg-emerald-500 text-slate-950'
                            : b.runs === 0
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-teal-500 text-slate-950'
                        }`}
                      >
                        {b.isWicket ? 'W' : b.runs}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[11px]">Ready for over...</span>
                  )}
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
                      {currentBowlerStat ? `${currentBowlerStat.wickets}/${currentBowlerStat.bowlerRuns} (${formatOvers(currentBowlerStat.bowlerBalls)}ov)` : '0/0 (0.0ov)'}
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
                  onClick={() => setShowFullScorecard(!showFullScorecard)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow ${
                    showFullScorecard
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                      : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{showFullScorecard ? 'Hide Scorecard' : 'Full Scorecard 📋'}</span>
                </button>

                <button
                  onClick={() => resetMatch()}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition border border-slate-700"
                  title="Reset Live T5 Match"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* FULL OFFICIAL MATCH SCORECARD MODAL / PANEL */}
            {showFullScorecard && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950/95 border-2 border-amber-400/60 rounded-2xl p-4 space-y-4 shadow-2xl font-mono text-xs text-left"
              >
                {/* Scorecard Header Tabs */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <h3 className="text-sm font-extrabold text-white">Full Official Match Scorecard</h3>
                  </div>

                  {/* Innings 1 / 2 Tab Switches */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setScorecardTab(1)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                        scorecardTab === 1
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Innings 1 ({homeTeam.name})
                    </button>
                    <button
                      type="button"
                      onClick={() => setScorecardTab(2)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                        scorecardTab === 2
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      Innings 2 ({awayTeam.name})
                    </button>
                  </div>
                </div>

                {/* INNINGS 1 SCORECARD */}
                {scorecardTab === 1 && (
                  <div className="space-y-4">
                    {/* Batting Table (Team 1) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span className="flex items-center space-x-1.5">
                          <img src={homeTeam.flagUrl} alt="" className="w-4 h-3 rounded object-cover" />
                          <span>{homeTeam.name} Batting Scorecard</span>
                        </span>
                        <span>{homeScore.runs}/{homeScore.wickets} ({formatOvers(ballIndex1)} ov)</span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                            <tr>
                              <th className="p-2">Batter</th>
                              <th className="p-2 text-center">Status</th>
                              <th className="p-2 text-right">R</th>
                              <th className="p-2 text-right">B</th>
                              <th className="p-2 text-right">4s</th>
                              <th className="p-2 text-right">6s</th>
                              <th className="p-2 text-right">SR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                            {homeSquad.map((player, idx) => {
                              const stat = homeStats[idx] || { name: player.name, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false };
                              const sr = stat.balls > 0 ? ((stat.runs / stat.balls) * 100).toFixed(1) : '0.0';
                              const isCurrent = currentInnings === 1 && (idx === strikerIdx1 || idx === nonStrikerIdx1);
                              return (
                                <tr key={idx} className={isCurrent ? 'bg-emerald-500/10 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-900/40'}>
                                  <td className="p-2 font-semibold">
                                    {player.name} {isCurrent && '*'}
                                  </td>
                                  <td className="p-2 text-center">
                                    {stat.isOut ? (
                                      <span className="text-rose-400 font-bold">Out 🔴</span>
                                    ) : stat.balls > 0 ? (
                                      <span className="text-emerald-400 font-bold">Not Out 🟢</span>
                                    ) : (
                                      <span className="text-slate-600">Yet to bat</span>
                                    )}
                                  </td>
                                  <td className="p-2 text-right font-bold text-white">{stat.runs}</td>
                                  <td className="p-2 text-right text-slate-400">{stat.balls}</td>
                                  <td className="p-2 text-right text-emerald-400">{stat.fours}</td>
                                  <td className="p-2 text-right text-amber-400">{stat.sixes}</td>
                                  <td className="p-2 text-right text-slate-400">{sr}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bowling Table (Team 2) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                        <span className="flex items-center space-x-1.5">
                          <img src={awayTeam.flagUrl} alt="" className="w-4 h-3 rounded object-cover" />
                          <span>{awayTeam.name} Bowling Figures</span>
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                            <tr>
                              <th className="p-2">Bowler</th>
                              <th className="p-2 text-right">Overs</th>
                              <th className="p-2 text-right">Runs</th>
                              <th className="p-2 text-right">Wickets</th>
                              <th className="p-2 text-right">Econ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                            {awaySquad.map((player, idx) => {
                              const stat = awayStats[idx] || { wickets: 0, bowlerRuns: 0, bowlerBalls: 0 };
                              if (stat.bowlerBalls === 0) return null;
                              const oversFormatted = formatOvers(stat.bowlerBalls);
                              const econ = stat.bowlerBalls > 0 ? (stat.bowlerRuns / (stat.bowlerBalls / 6)).toFixed(2) : '0.00';
                              return (
                                <tr key={idx} className="text-slate-300 hover:bg-slate-900/40">
                                  <td className="p-2 font-semibold text-purple-300">{player.name}</td>
                                  <td className="p-2 text-right font-mono text-slate-300">{oversFormatted}</td>
                                  <td className="p-2 text-right font-bold text-white">{stat.bowlerRuns}</td>
                                  <td className="p-2 text-right font-bold text-amber-400">{stat.wickets}</td>
                                  <td className="p-2 text-right text-slate-400">{econ}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* INNINGS 2 SCORECARD */}
                {scorecardTab === 2 && (
                  <div className="space-y-4">
                    {/* Batting Table (Team 2) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                        <span className="flex items-center space-x-1.5">
                          <img src={awayTeam.flagUrl} alt="" className="w-4 h-3 rounded object-cover" />
                          <span>{awayTeam.name} Batting Scorecard</span>
                        </span>
                        <span>{awayScore.runs}/{awayScore.wickets} ({formatOvers(ballIndex2)} ov)</span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                            <tr>
                              <th className="p-2">Batter</th>
                              <th className="p-2 text-center">Status</th>
                              <th className="p-2 text-right">R</th>
                              <th className="p-2 text-right">B</th>
                              <th className="p-2 text-right">4s</th>
                              <th className="p-2 text-right">6s</th>
                              <th className="p-2 text-right">SR</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                            {awaySquad.map((player, idx) => {
                              const stat = awayStats[idx] || { name: player.name, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false };
                              const sr = stat.balls > 0 ? ((stat.runs / stat.balls) * 100).toFixed(1) : '0.0';
                              const isCurrent = currentInnings === 2 && (idx === strikerIdx2 || idx === nonStrikerIdx2);
                              return (
                                <tr key={idx} className={isCurrent ? 'bg-emerald-500/10 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-900/40'}>
                                  <td className="p-2 font-semibold">
                                    {player.name} {isCurrent && '*'}
                                  </td>
                                  <td className="p-2 text-center">
                                    {stat.isOut ? (
                                      <span className="text-rose-400 font-bold">Out 🔴</span>
                                    ) : stat.balls > 0 ? (
                                      <span className="text-emerald-400 font-bold">Not Out 🟢</span>
                                    ) : (
                                      <span className="text-slate-600">Yet to bat</span>
                                    )}
                                  </td>
                                  <td className="p-2 text-right font-bold text-white">{stat.runs}</td>
                                  <td className="p-2 text-right text-slate-400">{stat.balls}</td>
                                  <td className="p-2 text-right text-emerald-400">{stat.fours}</td>
                                  <td className="p-2 text-right text-amber-400">{stat.sixes}</td>
                                  <td className="p-2 text-right text-slate-400">{sr}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Bowling Table (Team 1) */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                        <span className="flex items-center space-x-1.5">
                          <img src={homeTeam.flagUrl} alt="" className="w-4 h-3 rounded object-cover" />
                          <span>{homeTeam.name} Bowling Figures</span>
                        </span>
                      </div>

                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800">
                            <tr>
                              <th className="p-2">Bowler</th>
                              <th className="p-2 text-right">Overs</th>
                              <th className="p-2 text-right">Runs</th>
                              <th className="p-2 text-right">Wickets</th>
                              <th className="p-2 text-right">Econ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 bg-slate-950/60">
                            {homeSquad.map((player, idx) => {
                              const stat = homeStats[idx] || { wickets: 0, bowlerRuns: 0, bowlerBalls: 0 };
                              if (stat.bowlerBalls === 0) return null;
                              const oversFormatted = formatOvers(stat.bowlerBalls);
                              const econ = stat.bowlerBalls > 0 ? (stat.bowlerRuns / (stat.bowlerBalls / 6)).toFixed(2) : '0.00';
                              return (
                                <tr key={idx} className="text-slate-300 hover:bg-slate-900/40">
                                  <td className="p-2 font-semibold text-purple-300">{player.name}</td>
                                  <td className="p-2 text-right font-mono text-slate-300">{oversFormatted}</td>
                                  <td className="p-2 text-right font-bold text-white">{stat.bowlerRuns}</td>
                                  <td className="p-2 text-right font-bold text-amber-400">{stat.wickets}</td>
                                  <td className="p-2 text-right text-slate-400">{econ}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

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
                            {b.wickets}/{b.bowlerRuns} ({formatOvers(b.bowlerBalls)}ov)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Live TV Commentary Ticker Feed */}
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-xs text-left">
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Real TV Commentary Feed (Ian Bishop & Ravi Shastri Style)</span>
                </span>

                <button
                  type="button"
                  onClick={() => setIsVoiceCommentaryOn(!isVoiceCommentaryOn)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold flex items-center space-x-1.5 transition ${
                    isVoiceCommentaryOn
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-900 text-slate-500 border-slate-800'
                  }`}
                  title="Toggle Browser Audio Speech Commentary"
                >
                  {isVoiceCommentaryOn ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Voice TTS: {isVoiceCommentaryOn ? 'ON 🔊' : 'OFF 🔇'}</span>
                </button>
              </div>

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
                  <p className="text-slate-500 text-center py-4">Click Play to start live 5-Over 2-Innings T5 Cricket Match!</p>
                )}
              </div>
            </div>

            <div className="pt-1 text-center text-[10px] text-amber-400/70 font-mono pb-2">
              ⚠️ Disclaimer: Live ball-by-ball events, player names, and scores are procedurally simulated for tournament play and may be incorrect or fictional.
            </div>

          </div>
        </motion.div>
      </div>

      {/* TV DRS Decision Review System Replay Modal */}
      <DrsReviewModal
        isOpen={isDrsOpen}
        onClose={() => setIsDrsOpen(false)}
        reviewData={drsReviewData}
      />
    </AnimatePresence>
  );
};
