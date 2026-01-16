// UEFA Euro 2020 Adapter
// Uses OpenLigaDB API for tournament match data
// Note: Euro matches typically don't provide real-time minute updates, estimated based on kickoff time

import type { SportAdapter, ScoreChangeResult } from '../../adapters/SportAdapter';
import type { Game, TournamentGame, CelebrationType } from '../../types/game';
import type { GameStatus, Team } from '../../types/base';
import type { SoccerClock, Goal } from '../../types/bundesliga';
import type {
  TournamentMatch,
  TournamentTeam
} from '../../types/tournament';
import type { GameStats } from '../../types/stats';
import { API_ENDPOINTS } from '../../constants/api';
import { getBestLogoUrl } from '../../utils/logoFallback';

// UEFA Euro team colors (placeholder - will be populated with actual team colors)
const EURO_TEAM_COLORS: Record<number, string> = {
  // Will be populated with actual team IDs from OpenLigaDB em20 data
  // Example placeholder colors for major teams
};

export class EuroAdapter implements SportAdapter {
  sport = 'euro' as const;

  async fetchScoreboard(): Promise<Game[]> {
    try {
      // UEFA Euro 2020 (held in 2021)
      const season = 2020;
      const leagueCode = 'em20';

      const allGames: Game[] = [];

      // Fetch Euro games
      try {
        const euroGroupResponse = await fetch(`${API_ENDPOINTS.bundesligaCurrentGroup}?league=${leagueCode}`);
        if (euroGroupResponse.ok) {
          const euroGroup: { groupOrderID: number } = await euroGroupResponse.json();
          const euroMatchesResponse = await fetch(
            `${API_ENDPOINTS.bundesligaMatchday(euroGroup.groupOrderID)}?season=${season}&league=${leagueCode}`
          );
          if (euroMatchesResponse.ok) {
            const euroMatches: TournamentMatch[] = await euroMatchesResponse.json();
            allGames.push(...euroMatches.map((match) => this.transformMatch(match)));
          }
        }
      } catch (err) {
        console.warn('Error fetching UEFA Euro games:', err);
      }

      return allGames;
    } catch (error) {
      console.error('Error fetching Euro scoreboard:', error);
      throw error;
    }
  }

  async fetchGameDetails(gameId: string): Promise<{ game: Game; stats: GameStats | null }> {
    try {
      const response = await fetch(API_ENDPOINTS.bundesligaMatch(gameId));
      if (!response.ok) {
        throw new Error(`OpenLigaDB error: ${response.statusText}`);
      }
      const match: TournamentMatch = await response.json();

      // OpenLigaDB doesn't provide detailed stats
      return {
        game: this.transformMatch(match),
        stats: null,
      };
    } catch (error) {
      console.error('Error fetching Euro game details:', error);
      throw error;
    }
  }

  detectScoreChange(
    prevHome: number,
    prevAway: number,
    newHome: number,
    newAway: number,
    game: Game
  ): ScoreChangeResult | null {
    const homeDiff = newHome - prevHome;
    const awayDiff = newAway - prevAway;

    // No score change
    if (homeDiff === 0 && awayDiff === 0) {
      return null;
    }

    const tournamentGame = game as TournamentGame;

    // Determine which team scored
    if (homeDiff > 0) {
      const latestGoal = tournamentGame.goals[tournamentGame.goals.length - 1];
      return {
        type: this.getGoalVideoType(latestGoal),
        team: 'home',
      };
    } else if (awayDiff > 0) {
      const latestGoal = tournamentGame.goals[tournamentGame.goals.length - 1];
      return {
        type: this.getGoalVideoType(latestGoal),
        team: 'away',
      };
    }

    return null;
  }

  private getGoalVideoType(goal?: Goal): CelebrationType {
    if (!goal) return 'goal';

    if (goal.isPenalty) return 'penalty';
    if (goal.isOwnGoal) return 'own_goal';
    return 'goal';
  }

  getPeriodName(period: string): string {
    switch (period) {
      case 'first_half':
        return '1. Halbzeit';
      case 'second_half':
        return '2. Halbzeit';
      case 'halftime':
        return 'Halbzeit';
      case 'extra_time':
        return 'Verlängerung';
      default:
        return '';
    }
  }

  getCompetitionName(game: Game): string {
    const tournamentGame = game as TournamentGame;
    return tournamentGame.round || 'UEFA Europameisterschaft 2020';
  }

  getCelebrationTypes(): CelebrationType[] {
    return ['goal', 'penalty', 'own_goal', 'red_card', 'yellow_red_card'];
  }

  // Transform OpenLigaDB tournament match to our Game format
  private transformMatch(oldbMatch: TournamentMatch): TournamentGame {
    // Extract halftime and final scores
    const halftimeResult = oldbMatch.matchResults?.find(
      (r) => r.resultTypeID === 1
    );
    const finalResult = oldbMatch.matchResults?.find(
      (r) => r.resultTypeID === 2
    );

    // Determine status
    const status = this.determineGameStatus(oldbMatch);

    // Transform goals
    const goals: Goal[] = (oldbMatch.goals || []).map((g) => ({
      goalId: g.goalID,
      minute: g.matchMinute,
      scorerName: g.goalGetterName,
      scorerTeam: g.scoreTeam1 > (g.scoreTeam2 || 0) ? 'home' : 'away',
      isPenalty: g.isPenalty || false,
      isOwnGoal: g.isOwnGoal || false,
      scoreAfter: {
        home: g.scoreTeam1,
        away: g.scoreTeam2,
      },
    }));

    // Determine round and round type
    const { round, roundType, group } = this.determineRound(oldbMatch.group.groupName);

    return {
      id: oldbMatch.matchID.toString(),
      sport: 'euro',
      competition: 'uefa-euro',
      homeTeam: this.transformTeam(oldbMatch.team1, finalResult?.pointsTeam1 || 0),
      awayTeam: this.transformTeam(oldbMatch.team2, finalResult?.pointsTeam2 || 0),
      status,
      startTime: oldbMatch.matchDateTimeUTC,
      venue: oldbMatch.location?.locationStadium || oldbMatch.location?.locationCity || undefined,
      clock: this.buildClock(oldbMatch, goals),
      round,
      roundType,
      group,
      goals,
      halftimeScore: halftimeResult
        ? {
            home: halftimeResult.pointsTeam1,
            away: halftimeResult.pointsTeam2,
          }
        : undefined,
      lastUpdate: oldbMatch.lastUpdateDateTime,
    };
  }

  private determineRound(groupName: string): {
    round: string;
    roundType: TournamentGame['roundType'];
    group?: string;
  } {
    // Group phase examples: "Gruppenphase 1", "Gruppe A", "Gruppe B"
    if (groupName.toLowerCase().includes('gruppenphase') || groupName.toLowerCase().includes('gruppe')) {
      // Extract group letter if present
      const groupMatch = groupName.match(/Gruppe ([A-Z])/i);
      return {
        round: groupName,
        roundType: 'group',
        group: groupMatch ? `Gruppe ${groupMatch[1].toUpperCase()}` : undefined,
      };
    }

    // Knockout rounds
    const roundMap: Record<string, { round: string; roundType: TournamentGame['roundType'] }> = {
      'Achtelfinale': { round: 'Achtelfinale', roundType: 'round_of_16' },
      'Viertelfinale': { round: 'Viertelfinale', roundType: 'quarter_finals' },
      'Halbfinale': { round: 'Halbfinale', roundType: 'semi_finals' },
      'Finale': { round: 'Finale', roundType: 'final' },
    };

    for (const [german, data] of Object.entries(roundMap)) {
      if (groupName.toLowerCase().includes(german.toLowerCase())) {
        return { ...data, group: undefined };
      }
    }

    // Default to group phase if unknown
    return { round: groupName, roundType: 'group', group: undefined };
  }

  private determineGameStatus(match: TournamentMatch): GameStatus {
    if (match.matchIsFinished) {
      return 'final';
    }

    const now = Date.now();
    const kickoff = new Date(match.matchDateTime).getTime();
    const elapsed = now - kickoff;
    const elapsedMinutes = elapsed / 60000;

    // Check for postponed/cancelled games
    const hasMatchResults = match.matchResults && match.matchResults.length > 0;
    const hasGoals = match.goals && match.goals.length > 0;
    const TWO_HOURS_IN_MINUTES = 120;

    if (elapsedMinutes >= TWO_HOURS_IN_MINUTES && !hasMatchResults && !hasGoals && !match.matchIsFinished) {
      if (match.lastUpdateDateTime) {
        const lastUpdate = new Date(match.lastUpdateDateTime).getTime();
        const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
        if (kickoff - lastUpdate > TWENTY_FOUR_HOURS_MS) {
          return 'postponed';
        }
      }
      return 'postponed';
    }

    if (elapsedMinutes < 0) {
      return 'scheduled';
    }

    if (elapsedMinutes >= 45 && elapsedMinutes < 60) {
      return 'halftime';
    }

    if (elapsedMinutes >= 0) {
      return 'in_progress';
    }

    return 'scheduled';
  }

  private buildClock(match: TournamentMatch, goals: Goal[]): SoccerClock {
    const now = Date.now();
    const kickoff = new Date(match.matchDateTime).getTime();
    const elapsedMs = now - kickoff;
    const elapsedMinutes = Math.floor(elapsedMs / 60000);

    // Euro matches can have extra time in knockout stages
    const canHaveExtraTime = true;

    // Find the latest valid goal minute
    const validGoalMinutes = goals
      .map((g) => g.minute)
      .filter((m): m is number => m !== null && m !== undefined && !isNaN(m));
    const latestGoalMinute = validGoalMinutes.length > 0
      ? Math.max(...validGoalMinutes)
      : null;

    let period: SoccerClock['period'] = 'first_half';
    let matchMinute = 0;

    // FINISHED GAME
    if (match.matchIsFinished) {
      if (latestGoalMinute !== null && latestGoalMinute > 90 && canHaveExtraTime) {
        period = 'extra_time';
        matchMinute = latestGoalMinute;
      } else {
        period = 'second_half';
        matchMinute = latestGoalMinute !== null && latestGoalMinute > 90
          ? latestGoalMinute
          : 90;
      }
    }
    // GAME NOT STARTED YET
    else if (elapsedMinutes < 0) {
      period = 'first_half';
      matchMinute = 0;
    }
    // GAME IN PROGRESS - Use goal-based time first, then estimate
    else {
      if (latestGoalMinute !== null) {
        matchMinute = latestGoalMinute;

        const estimatedCurrentMinute = this.estimateCurrentMinute(
          elapsedMinutes,
          latestGoalMinute,
          canHaveExtraTime
        );

        if (estimatedCurrentMinute > matchMinute) {
          matchMinute = estimatedCurrentMinute;
        }
      } else {
        matchMinute = this.estimateCurrentMinute(elapsedMinutes, 0, canHaveExtraTime);
      }

      // Determine period based on calculated match minute
      if (matchMinute <= 45) {
        if (elapsedMinutes >= 47 && elapsedMinutes < 62) {
          period = 'halftime';
          matchMinute = 45;
        } else {
          period = 'first_half';
        }
      } else if (matchMinute <= 90) {
        period = 'second_half';
      } else if (canHaveExtraTime && matchMinute > 90) {
        period = 'extra_time';
      } else {
        period = 'second_half';
      }
    }

    const displayValue = this.buildDisplayValue(matchMinute, period, canHaveExtraTime);

    return {
      matchMinute,
      period,
      periodName: this.getPeriodName(period),
      displayValue,
    };
  }

  private estimateCurrentMinute(
    elapsedMinutes: number,
    minMinute: number,
    canHaveExtraTime: boolean
  ): number {
    let estimatedMinute: number;

    if (elapsedMinutes <= 45) {
      estimatedMinute = elapsedMinutes;
    } else if (elapsedMinutes <= 62) {
      estimatedMinute = 45;
    } else if (elapsedMinutes <= 107) {
      estimatedMinute = 45 + (elapsedMinutes - 62);
    } else if (canHaveExtraTime && elapsedMinutes <= 140) {
      estimatedMinute = 90 + (elapsedMinutes - 107);
    } else {
      estimatedMinute = canHaveExtraTime ? Math.min(elapsedMinutes - 20, 120) : 90;
    }

    return Math.max(minMinute, Math.max(0, estimatedMinute));
  }

  private buildDisplayValue(
    matchMinute: number,
    period: SoccerClock['period'],
    canHaveExtraTime: boolean
  ): string {
    if (period === 'halftime') {
      return "45'";
    }

    if (period === 'first_half') {
      if (matchMinute > 45) {
        const extra = matchMinute - 45;
        return `45+${extra}'`;
      }
      return `${Math.min(matchMinute, 45)}'`;
    }

    if (period === 'second_half') {
      if (matchMinute > 90) {
        const extra = matchMinute - 90;
        return `90+${extra}'`;
      }
      return `${Math.max(45, Math.min(matchMinute, 90))}'`;
    }

    if (period === 'extra_time' && canHaveExtraTime) {
      if (matchMinute <= 105) {
        return `${matchMinute}'`;
      } else if (matchMinute <= 120) {
        return `${matchMinute}'`;
      } else {
        const extra = matchMinute - 120;
        return `120+${extra}'`;
      }
    }

    return `${matchMinute}'`;
  }

  private transformTeam(team: TournamentTeam, score: number): Team {
    // Use fallback for better logo quality (Wikimedia Commons)
    const logo = getBestLogoUrl(team.teamIconUrl, team.teamName);

    // Use team-specific colors if available
    const color = EURO_TEAM_COLORS[team.teamId] || '003399'; // Default UEFA Euro blue
    const alternateColor = 'FFFFFF';

    return {
      id: team.teamId.toString(),
      name: team.teamName,
      abbreviation: team.shortName,
      displayName: team.teamName,
      shortDisplayName: team.shortName,
      logo,
      color,
      alternateColor,
      score,
    };
  }
}
