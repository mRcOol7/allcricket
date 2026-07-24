import { create } from 'zustand';
import { Country, CricketTournament, CricketTournamentSize, CricketMatch, PitchType, PastChampionRecord } from '../types/cricket';
import { fetchRestCountriesV5 } from '../services/restCountriesApi';
import { startNewCricketTournament, advanceCricketRound } from '../engine/cricketEngine';

const PAST_CHAMPIONS_KEY = 'cricket_past_champions_v1';

function saveTournamentToHistory(tourney: CricketTournament, existingHistory: PastChampionRecord[]): PastChampionRecord[] {
  if (!tourney.champion) return existingHistory;

  const record: PastChampionRecord = {
    id: tourney.id,
    tournamentName: tourney.name,
    champion: tourney.champion,
    runnerUp: tourney.runnerUp,
    orangeCapPlayer: tourney.awards?.orangeCap?.player,
    orangeCapTeam: tourney.awards?.orangeCap?.team.name,
    orangeCapRuns: tourney.awards?.orangeCap?.runs,
    purpleCapPlayer: tourney.awards?.purpleCap?.player,
    purpleCapTeam: tourney.awards?.purpleCap?.team.name,
    purpleCapWickets: tourney.awards?.purpleCap?.wickets,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  };

  // Avoid duplicates
  const filtered = existingHistory.filter(h => h.id !== record.id);
  const updated = [record, ...filtered];
  try {
    localStorage.setItem(PAST_CHAMPIONS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save past champions to localStorage:', e);
  }
  return updated;
}

function loadHistoryFromStorage(): PastChampionRecord[] {
  try {
    const raw = localStorage.getItem(PAST_CHAMPIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

interface CricketState {
  allCountries: Country[];
  sovereignCountries: Country[];
  isLoadingCountries: boolean;
  currentTournament: CricketTournament | null;
  bracketSize: CricketTournamentSize;
  pitchType: PitchType;
  isDirectoryOpen: boolean;
  isStatsOpen: boolean;
  selectedMatch: CricketMatch | null;
  pastChampions: PastChampionRecord[];

  // Actions
  loadCountries: () => Promise<void>;
  setBracketSize: (size: CricketTournamentSize) => void;
  setPitchType: (pitch: PitchType) => void;
  startTournament: () => void;
  nextRound: () => void;
  simulateAllRounds: () => void;
  resetTournament: () => void;
  toggleDirectory: (open?: boolean) => void;
  toggleStats: (open?: boolean) => void;
  setSelectedMatch: (match: CricketMatch | null) => void;
  clearHistory: () => void;
}

export const useCricketStore = create<CricketState>((set, get) => ({
  allCountries: [],
  sovereignCountries: [],
  isLoadingCountries: false,
  currentTournament: null,
  bracketSize: 256,
  pitchType: 'BALANCED',
  isDirectoryOpen: false,
  isStatsOpen: false,
  selectedMatch: null,
  pastChampions: loadHistoryFromStorage(),

  loadCountries: async () => {
    set({ isLoadingCountries: true });
    try {
      const { allCountries, sovereignCountries } = await fetchRestCountriesV5();
      set({
        allCountries,
        sovereignCountries,
        isLoadingCountries: false,
        pastChampions: loadHistoryFromStorage()
      });
    } catch (e) {
      console.error('Error loading countries in store:', e);
      set({ isLoadingCountries: false });
    }
  },

  setBracketSize: (bracketSize) => set({ bracketSize }),
  setPitchType: (pitchType) => set({ pitchType }),

  startTournament: () => {
    const { sovereignCountries, allCountries, bracketSize, pitchType } = get();
    if (sovereignCountries.length === 0 && allCountries.length === 0) return;
    const tourney = startNewCricketTournament(sovereignCountries, allCountries, bracketSize, pitchType);
    set({ currentTournament: tourney });
  },

  nextRound: () => {
    const { currentTournament, pastChampions } = get();
    if (!currentTournament || currentTournament.status === 'COMPLETED') return;
    const updated = advanceCricketRound(currentTournament);
    
    let newHistory = pastChampions;
    if (updated.status === 'COMPLETED') {
      newHistory = saveTournamentToHistory(updated, pastChampions);
    }

    set({ currentTournament: updated, pastChampions: newHistory });
  },

  simulateAllRounds: () => {
    let { currentTournament, pastChampions } = get();
    if (!currentTournament || currentTournament.status === 'COMPLETED') return;
    
    let updated = currentTournament;
    while (updated.status !== 'COMPLETED') {
      updated = advanceCricketRound(updated);
    }

    const newHistory = saveTournamentToHistory(updated, pastChampions);
    set({ currentTournament: updated, pastChampions: newHistory });
  },

  resetTournament: () => {
    set({ currentTournament: null, selectedMatch: null });
  },

  toggleDirectory: (open) => {
    set((state) => ({
      isDirectoryOpen: open !== undefined ? open : !state.isDirectoryOpen
    }));
  },

  toggleStats: (open) => {
    set((state) => ({
      isStatsOpen: open !== undefined ? open : !state.isStatsOpen
    }));
  },

  setSelectedMatch: (selectedMatch) => set({ selectedMatch }),

  clearHistory: () => {
    try {
      localStorage.removeItem(PAST_CHAMPIONS_KEY);
    } catch (e) {}
    set({ pastChampions: [] });
  }
}));
