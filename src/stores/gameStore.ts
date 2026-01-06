import { create } from 'zustand';
import type { Game } from '../types/game';
import type { GameStats } from '../types/stats';

interface PreviousScores {
  home: number;
  away: number;
}

interface GameState {
  // Current Game
  currentGame: Game | null;
  isLive: boolean;
  
  // Manually selected game ID (prevents auto-override)
  manuallySelectedGameId: string | null;
  
  // All available games (for game selector)
  availableGames: Game[];
  
  // Scores tracking (for change detection)
  previousScores: PreviousScores;
  
  // Stats
  gameStats: GameStats | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentGame: (game: Game | null) => void;
  selectGame: (game: Game | null) => void; // Manual selection
  setAvailableGames: (games: Game[]) => void;
  updateScores: (home: number, away: number) => void;
  setGameStats: (stats: GameStats | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearManualSelection: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentGame: null,
  isLive: false,
  manuallySelectedGameId: null,
  availableGames: [],
  previousScores: { home: 0, away: 0 },
  gameStats: null,
  isLoading: false,
  error: null,

  // Auto-set (from polling) - respects manual selection
  setCurrentGame: (game) => {
    const { manuallySelectedGameId } = get();
    
    // If user manually selected a game, don't override it
    if (manuallySelectedGameId && game?.id !== manuallySelectedGameId) {
      return;
    }
    
    const isLive = game?.status === 'in_progress' || game?.status === 'halftime';
    set({ 
      currentGame: game, 
      isLive,
      previousScores: game 
        ? { home: game.homeTeam.score, away: game.awayTeam.score }
        : { home: 0, away: 0 },
    });
  },

  // Manual selection - always applies
  selectGame: (game) => {
    const isLive = game?.status === 'in_progress' || game?.status === 'halftime';
    set({ 
      currentGame: game, 
      isLive,
      manuallySelectedGameId: game?.id || null,
      previousScores: game 
        ? { home: game.homeTeam.score, away: game.awayTeam.score }
        : { home: 0, away: 0 },
    });
  },

  setAvailableGames: (games) => set({ availableGames: games }),

  updateScores: (home, away) => {
    const { previousScores } = get();
    
    if (previousScores.home !== home || previousScores.away !== away) {
      set({ previousScores: { home, away } });
    }
  },

  setGameStats: (stats) => set({ gameStats: stats }),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearManualSelection: () => set({ manuallySelectedGameId: null }),
}));
