export interface Country {
  id: string;
  alpha2: string;
  name: string;
  officialName: string;
  flagUrl: string;
  emoji: string;
  isoCode: string;
  fifaCode: string;
  region: string;
  subregion?: string;
  population: number;
  isSovereign: boolean;
  isUnMember?: boolean;
}

export interface CricketBatterPerf {
  player: string;
  teamId: string;
  teamName: string;
  runs: number;
  balls: number;
}

export interface CricketBowlerPerf {
  player: string;
  teamId: string;
  teamName: string;
  wickets: number;
  runsGiven: number;
}

export interface CricketMatch {
  id: string;
  roundName: string;
  homeTeam: Country;
  awayTeam: Country;
  homeRuns: number;
  homeWickets: number;
  homeOvers: string; // e.g. "20.0" or "18.4"
  awayRuns: number;
  awayWickets: number;
  awayOvers: string;
  isSuperOver?: boolean;
  superOverHomeRuns?: number;
  superOverAwayRuns?: number;
  status: 'SCHEDULED' | 'COMPLETED';
  winnerId?: string;
  isBye?: boolean;
  topBatter?: CricketBatterPerf;
  topBowler?: CricketBowlerPerf;
}

export interface CricketRound {
  id: string;
  name: string;
  matches: CricketMatch[];
  isCompleted: boolean;
}

export type CricketTournamentSize = 256 | 128 | 64 | 32 | 16;

export interface CricketAwards {
  orangeCap?: {
    player: string;
    team: Country;
    runs: number;
  };
  purpleCap?: {
    player: string;
    team: Country;
    wickets: number;
  };
  totalRuns: number;
  totalWickets: number;
  totalMatches: number;
}

export interface CricketTournament {
  id: string;
  name: string;
  bracketSize: CricketTournamentSize;
  totalTeams: number;
  rounds: CricketRound[];
  currentRoundIndex: number;
  status: 'SETUP' | 'IN_PROGRESS' | 'COMPLETED';
  champion?: Country;
  runnerUp?: Country;
  awards?: CricketAwards;
  createdAt: string;
}
