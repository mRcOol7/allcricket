import { Country, CricketMatch, CricketRound, CricketTournament, CricketAwards, CricketTournamentSize, CricketBatterPerf, CricketBowlerPerf } from '../types/cricket';
import { getRandomCricketBatter, getRandomCricketBowler } from './cricketPlayerNames';

export function getRoundName(totalTeamsInRound: number, isFinal: boolean = false): string {
  if (isFinal || totalTeamsInRound === 2) return 'Final';
  if (totalTeamsInRound === 4) return 'Semi-Finals';
  if (totalTeamsInRound === 8) return 'Quarter-Finals';
  if (totalTeamsInRound === 16) return 'Round of 16';
  if (totalTeamsInRound === 32) return 'Round of 32';
  if (totalTeamsInRound === 64) return 'Round of 64';
  if (totalTeamsInRound === 128) return 'Round of 128';
  if (totalTeamsInRound === 256) return 'Round of 256';
  return `Round of ${totalTeamsInRound}`;
}

// Generate realistic T20 Cricket scores & Super Overs
export function simulateCricketMatch(home: Country, away: Country, roundName: string): CricketMatch {
  // Realistic T20 score range (130 to 220 runs)
  const homeRuns = 130 + Math.floor(Math.random() * 85);
  const homeWickets = Math.min(10, Math.floor(Math.random() * 8) + 2);
  const homeOvers = homeWickets === 10 ? `${Math.floor(Math.random() * 4) + 16}.${Math.floor(Math.random() * 6)}` : '20.0';

  let awayRuns = 130 + Math.floor(Math.random() * 85);
  let awayWickets = Math.min(10, Math.floor(Math.random() * 8) + 2);
  let awayOvers = '20.0';

  let isSuperOver = false;
  let superOverHomeRuns: number | undefined;
  let superOverAwayRuns: number | undefined;
  let winnerId: string;

  if (homeRuns === awayRuns) {
    // Tied Cricket match -> Super Over!
    isSuperOver = true;
    let hSO = Math.floor(Math.random() * 12) + 8; // 8 to 20 runs
    let aSO = Math.floor(Math.random() * 12) + 8;

    if (hSO === aSO) {
      if (Math.random() > 0.5) hSO += 2;
      else aSO += 2;
    }

    superOverHomeRuns = hSO;
    superOverAwayRuns = aSO;
    winnerId = hSO > aSO ? home.id : away.id;
  } else {
    winnerId = homeRuns > awayRuns ? home.id : away.id;
    if (winnerId === away.id) {
      awayOvers = `${Math.floor(Math.random() * 3) + 17}.${Math.floor(Math.random() * 6)}`;
    }
  }

  // Generate Top Batter & Top Bowler
  const topBatterName = getRandomCricketBatter(homeRuns >= awayRuns ? home.id : away.id, homeRuns >= awayRuns ? home.region : away.region);
  const topBatterTeam = homeRuns >= awayRuns ? home : away;
  const topBatterRuns = 45 + Math.floor(Math.random() * 45);
  const topBatterBalls = Math.round(topBatterRuns * (0.65 + Math.random() * 0.4));

  const topBatter: CricketBatterPerf = {
    player: topBatterName,
    teamId: topBatterTeam.id,
    teamName: topBatterTeam.name,
    runs: topBatterRuns,
    balls: topBatterBalls
  };

  const winningTeam = winnerId === home.id ? home : away;
  const topBowlerName = getRandomCricketBowler(winningTeam.id, winningTeam.region);
  const topBowlerWickets = 2 + Math.floor(Math.random() * 3); // 2 to 4 wickets
  const topBowlerRunsGiven = 16 + Math.floor(Math.random() * 20);

  const topBowler: CricketBowlerPerf = {
    player: topBowlerName,
    teamId: winningTeam.id,
    teamName: winningTeam.name,
    wickets: topBowlerWickets,
    runsGiven: topBowlerRunsGiven
  };

  return {
    id: `cricket_match_${home.id}_vs_${away.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    roundName,
    homeTeam: home,
    awayTeam: away,
    homeRuns,
    homeWickets,
    homeOvers,
    awayRuns,
    awayWickets,
    awayOvers,
    isSuperOver,
    superOverHomeRuns,
    superOverAwayRuns,
    status: 'COMPLETED',
    winnerId,
    topBatter,
    topBowler
  };
}

// Calculate Orange Cap (Top Batter) & Purple Cap (Top Bowler)
export function calculateCricketAwards(tournament: CricketTournament): CricketAwards {
  const batterRunsMap: Record<string, { player: string; team: Country; runs: number }> = {};
  const bowlerWicketsMap: Record<string, { player: string; team: Country; wickets: number }> = {};

  let totalRuns = 0;
  let totalWickets = 0;
  let totalMatches = 0;

  tournament.rounds.forEach(round => {
    round.matches.forEach(match => {
      if (match.status !== 'COMPLETED' || match.isBye) return;
      totalMatches += 1;
      totalRuns += match.homeRuns + match.awayRuns;
      totalWickets += match.homeWickets + match.awayWickets;

      if (match.topBatter) {
        const team = match.topBatter.teamId === match.homeTeam.id ? match.homeTeam : match.awayTeam;
        const key = `${match.topBatter.teamId}_${match.topBatter.player}`;
        batterRunsMap[key] = batterRunsMap[key]
          ? { player: match.topBatter.player, team, runs: batterRunsMap[key].runs + match.topBatter.runs }
          : { player: match.topBatter.player, team, runs: match.topBatter.runs };
      }

      if (match.topBowler) {
        const team = match.topBowler.teamId === match.homeTeam.id ? match.homeTeam : match.awayTeam;
        const key = `${match.topBowler.teamId}_${match.topBowler.player}`;
        bowlerWicketsMap[key] = bowlerWicketsMap[key]
          ? { player: match.topBowler.player, team, wickets: bowlerWicketsMap[key].wickets + match.topBowler.wickets }
          : { player: match.topBowler.player, team, wickets: match.topBowler.wickets };
      }
    });
  });

  const sortedBatters = Object.values(batterRunsMap).sort((a, b) => b.runs - a.runs);
  const orangeCap = sortedBatters[0];

  const sortedBowlers = Object.values(bowlerWicketsMap).sort((a, b) => b.wickets - a.wickets);
  const purpleCap = sortedBowlers[0];

  return {
    orangeCap,
    purpleCap,
    totalRuns,
    totalWickets,
    totalMatches
  };
}

const BONUS_WILDCARDS: Country[] = [
  { id: 'WLD_1', alpha2: 'UN', name: 'Global Cricket XI', officialName: 'ICC World All-Stars', flagUrl: 'https://flagcdn.com/w160/un.png', emoji: '🌐', isoCode: 'WLD', fifaCode: 'WLD', region: 'International', population: 8000000000, isSovereign: true },
  { id: 'WLD_2', alpha2: 'AQ', name: 'Antarctica Cricket XI', officialName: 'Antarctica Cricket Board', flagUrl: 'https://flagcdn.com/w160/aq.png', emoji: '🇦🇶', isoCode: 'ATA', fifaCode: 'ATA', region: 'Oceania', population: 5000, isSovereign: true }
];

export function startNewCricketTournament(
  sovereignTeams: Country[],
  allFetchedCountries: Country[],
  size: CricketTournamentSize
): CricketTournament {
  let pool: Country[] = [];

  if (size === 256) {
    const merged = [...sovereignTeams];
    const nonSovereigns = allFetchedCountries.filter(c => !c.isSovereign);

    nonSovereigns.forEach(c => {
      if (merged.length < 256 && !merged.some(m => m.id === c.id)) {
        merged.push(c);
      }
    });

    BONUS_WILDCARDS.forEach(w => {
      if (merged.length < 256 && !merged.some(m => m.id === w.id)) {
        merged.push(w);
      }
    });

    pool = merged.slice(0, 256);
  } else {
    pool = [...sovereignTeams].slice(0, size);
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const numTeams = shuffled.length;
  const matches: CricketMatch[] = [];
  const r1Name = getRoundName(numTeams);

  for (let i = 0; i < numTeams; i += 2) {
    if (i + 1 < numTeams) {
      const home = shuffled[i];
      const away = shuffled[i + 1];
      const match = simulateCricketMatch(home, away, r1Name);
      matches.push(match);
    }
  }

  const initialRound: CricketRound = {
    id: `c_round_1_${Date.now()}`,
    name: r1Name,
    matches,
    isCompleted: true
  };

  const tourney: CricketTournament = {
    id: `cricket_tourney_${Date.now()}`,
    name: `Cricket World Cup Knockout Championship (${numTeams} Teams)`,
    bracketSize: size,
    totalTeams: numTeams,
    rounds: [initialRound],
    currentRoundIndex: 0,
    status: 'IN_PROGRESS',
    createdAt: new Date().toISOString()
  };

  tourney.awards = calculateCricketAwards(tourney);
  return tourney;
}

export function advanceCricketRound(tournament: CricketTournament): CricketTournament {
  const updated: CricketTournament = JSON.parse(JSON.stringify(tournament));
  const currentRound = updated.rounds[updated.currentRoundIndex];

  const winners: Country[] = currentRound.matches
    .map(m => (m.winnerId === m.homeTeam.id ? m.homeTeam : m.awayTeam))
    .filter(c => c.id !== 'BYE');

  if (winners.length <= 1) {
    updated.status = 'COMPLETED';
    updated.champion = winners[0];
    const finalMatch = currentRound.matches[0];
    if (finalMatch) {
      updated.runnerUp = finalMatch.winnerId === finalMatch.homeTeam.id ? finalMatch.awayTeam : finalMatch.homeTeam;
    }
    updated.awards = calculateCricketAwards(updated);
    return updated;
  }

  const nextTeamsCount = winners.length;
  const isFinal = nextTeamsCount === 2;
  const nextRoundName = getRoundName(nextTeamsCount, isFinal);
  const nextMatches: CricketMatch[] = [];

  for (let i = 0; i < nextTeamsCount; i += 2) {
    if (i + 1 < nextTeamsCount) {
      const home = winners[i];
      const away = winners[i + 1];
      const match = simulateCricketMatch(home, away, nextRoundName);
      nextMatches.push(match);
    }
  }

  const nextRound: CricketRound = {
    id: `c_round_${updated.rounds.length + 1}_${Date.now()}`,
    name: nextRoundName,
    matches: nextMatches,
    isCompleted: true
  };

  updated.rounds.push(nextRound);
  updated.currentRoundIndex += 1;

  if (nextTeamsCount === 2) {
    const finalMatch = nextMatches[0];
    if (finalMatch) {
      const champ = finalMatch.winnerId === finalMatch.homeTeam.id ? finalMatch.homeTeam : finalMatch.awayTeam;
      const runner = finalMatch.winnerId === finalMatch.homeTeam.id ? finalMatch.awayTeam : finalMatch.homeTeam;
      updated.champion = champ;
      updated.runnerUp = runner;
      updated.status = 'COMPLETED';
    }
  }

  updated.awards = calculateCricketAwards(updated);
  return updated;
}
