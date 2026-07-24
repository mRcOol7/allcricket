import { create } from 'zustand';
import { Country, CricketTournament, CricketTournamentSize } from '../types/cricket';
import { fetchRestCountriesV5 } from '../services/restCountriesApi';
import { startNewCricketTournament, advanceCricketRound } from '../engine/cricketEngine';

interface CricketState {
  allCountries: Country[];
  sovereignCountries: Country[];
  isLoadingCountries: boolean;
  currentTournament: CricketTournament | null;
  bracketSize: CricketTournamentSize;
  isDirectoryOpen: boolean;

  // Actions
  loadCountries: () => Promise<void>;
  setBracketSize: (size: CricketTournamentSize) => void;
  startTournament: () => void;
  nextRound: () => void;
  resetTournament: () => void;
  toggleDirectory: (open?: boolean) => void;
}

export const useCricketStore = create<CricketState>((set, get) => ({
  allCountries: [],
  sovereignCountries: [],
  isLoadingCountries: false,
  currentTournament: null,
  bracketSize: 256,
  isDirectoryOpen: false,

  loadCountries: async () => {
    set({ isLoadingCountries: true });
    try {
      const { allCountries, sovereignCountries } = await fetchRestCountriesV5();
      set({
        allCountries,
        sovereignCountries,
        isLoadingCountries: false
      });
    } catch (e) {
      console.error('Error loading countries in store:', e);
      set({ isLoadingCountries: false });
    }
  },

  setBracketSize: (bracketSize) => set({ bracketSize }),

  startTournament: () => {
    const { sovereignCountries, allCountries, bracketSize } = get();
    if (sovereignCountries.length === 0 && allCountries.length === 0) return;
    const tourney = startNewCricketTournament(sovereignCountries, allCountries, bracketSize);
    set({ currentTournament: tourney });
  },

  nextRound: () => {
    const { currentTournament } = get();
    if (!currentTournament || currentTournament.status === 'COMPLETED') return;
    const updated = advanceCricketRound(currentTournament);
    set({ currentTournament: updated });
  },

  resetTournament: () => {
    set({ currentTournament: null });
  },

  toggleDirectory: (open) => {
    set((state) => ({
      isDirectoryOpen: open !== undefined ? open : !state.isDirectoryOpen
    }));
  }
}));
