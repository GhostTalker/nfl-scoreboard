// UEFA Champions League specific types

import { BaseGame } from './base';
import { SoccerClock, Goal, Card } from './bundesliga';

// Re-export OpenLigaDB types as they're shared between Bundesliga and UEFA
export type {
  OpenLigaDBTeam,
  OpenLigaDBMatchResult,
  OpenLigaDBGoal,
  OpenLigaDBLocation,
  OpenLigaDBGroup,
  OpenLigaDBMatch,
  OpenLigaDBCurrentGroup,
} from './bundesliga';

export interface UEFAGame extends BaseGame {
  sport: 'uefa';
  competition: 'champions-league';
  clock: SoccerClock;
  matchday: number; // Round/Matchday in Champions League
  round?: string; // "Group Stage", "Round of 16", "Quarter-finals", "Semi-finals", "Final"
  goals: Goal[];
  halftimeScore?: { home: number; away: number };
  cards?: Card[];
}

export type UEFACelebrationType =
  | 'goal'
  | 'penalty'
  | 'own_goal'
  | 'red_card'
  | 'yellow_red_card';
