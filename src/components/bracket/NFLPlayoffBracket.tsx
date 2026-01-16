import { useGameStore } from '../../stores/gameStore';
import { isNFLGame } from '../../types/game';
import type { NFLGame, PlayoffMatchup, PlayoffTeam, PlayoffBracket } from '../../types/nfl';

export function NFLPlayoffBracket() {
  const currentGame = useGameStore((state) => state.currentGame);
  const availableGames = useGameStore((state) => state.availableGames);

  if (!currentGame || !isNFLGame(currentGame)) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900">
        <p className="text-white/50 text-xl">No NFL game data available</p>
      </div>
    );
  }

  // Build playoff bracket from available games
  const bracket = buildPlayoffBracket(availableGames.filter(isNFLGame), currentGame);

  return (
    <div className="h-full w-full bg-slate-900 p-4 overflow-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">NFL Playoffs {bracket.season}</h2>
        <p className="text-white/60 text-lg">{getRoundDisplayName(bracket.currentRound)}</p>
      </div>

      {/* Bracket Layout - Horizontal flow with connections */}
      <div className="max-w-[1800px] mx-auto">
        {/* AFC Conference */}
        <div className="mb-12">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-blue-400">AFC</h3>
          </div>
          <ConferenceBracketHorizontal
            conference="AFC"
            wildCard={bracket.afc.wildCard}
            divisional={bracket.afc.divisional}
            conferenceGame={bracket.afc.conference}
          />
        </div>

        {/* Super Bowl */}
        <div className="my-8">
          <SuperBowlMatchup matchup={bracket.superBowl} />
        </div>

        {/* NFC Conference */}
        <div className="mt-12">
          <div className="text-center mb-4">
            <h3 className="text-2xl font-bold text-red-400">NFC</h3>
          </div>
          <ConferenceBracketHorizontal
            conference="NFC"
            wildCard={bracket.nfc.wildCard}
            divisional={bracket.nfc.divisional}
            conferenceGame={bracket.nfc.conference}
          />
        </div>
      </div>

      {/* Swipe hint */}
      <div className="text-center mt-8 text-white/30 text-sm">
        Swipe left to return to scoreboard
      </div>
    </div>
  );
}

interface ConferenceBracketHorizontalProps {
  conference: 'AFC' | 'NFC';
  wildCard: PlayoffMatchup[];
  divisional: PlayoffMatchup[];
  conferenceGame: PlayoffMatchup | null;
}

function ConferenceBracketHorizontal({ conference, wildCard, divisional, conferenceGame }: ConferenceBracketHorizontalProps) {
  // Ensure we have exactly 3 wild card slots, 2 divisional slots, 1 conference slot
  const wcSlots = Array(3).fill(null).map((_, i) => wildCard[i] || createPlaceholderMatchup('wild_card', conference, i));
  const divSlots = Array(2).fill(null).map((_, i) => divisional[i] || createPlaceholderMatchup('divisional', conference, i));
  const confSlot = conferenceGame || createPlaceholderMatchup('conference', conference, 0);

  return (
    <div className="relative">
      <div className="grid grid-cols-4 gap-8">
        {/* Column 1: Wild Card Round (3 games + 1 bye) */}
        <div className="space-y-4 relative">
          <div className="text-center mb-3">
            <p className="text-xs text-white/50 font-semibold">WILD CARD</p>
          </div>
          {/* #1 Seed - Bye Week */}
          <div className="h-24 flex items-center justify-center bg-slate-800/30 rounded border border-slate-700/50">
            <div className="text-center">
              <span className="text-white/40 text-sm font-semibold">#1 Seed - BYE</span>
            </div>
          </div>
          {/* Wild Card Games */}
          {wcSlots.map((matchup, idx) => (
            <div key={idx} className="relative">
              <MatchupCard matchup={matchup} compact />
            </div>
          ))}
        </div>

        {/* Column 2: Divisional Round (2 games) */}
        <div className="space-y-4 relative">
          <div className="text-center mb-3">
            <p className="text-xs text-white/50 font-semibold">DIVISIONAL</p>
          </div>
          {/* Spacer for alignment */}
          <div className="h-16"></div>
          {divSlots.map((matchup, idx) => (
            <div key={idx} className="relative" style={{ marginTop: idx === 0 ? '0' : '8rem' }}>
              <MatchupCard matchup={matchup} compact />
            </div>
          ))}
        </div>

        {/* Column 3: Conference Championship (1 game) */}
        <div className="space-y-4 relative">
          <div className="text-center mb-3">
            <p className="text-xs text-white/50 font-semibold">CONFERENCE</p>
          </div>
          {/* Spacer for alignment */}
          <div className="h-32"></div>
          <MatchupCard matchup={confSlot} compact />
        </div>

        {/* Column 4: To Super Bowl */}
        <div className="flex items-center justify-center relative">
          <div className="text-center">
            <div className="text-white/40 text-sm mb-2">TO</div>
            <div className="text-white/60 font-bold">SUPER BOWL</div>
          </div>
        </div>
      </div>

      {/* Connection lines (SVG overlay) */}
      <BracketConnections />
    </div>
  );
}

function BracketConnections() {
  return (
    <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      {/* Wild Card → Divisional connections */}
      {/* Top WC games → Top Divisional */}
      <path
        d="M 25% 20%, L 35% 20%, L 35% 35%, L 50% 35%"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M 25% 35%, L 35% 35%, L 35% 35%, L 50% 35%"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />

      {/* Bottom WC games → Bottom Divisional */}
      <path
        d="M 25% 65%, L 35% 65%, L 35% 65%, L 50% 65%"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M 25% 80%, L 35% 80%, L 35% 65%, L 50% 65%"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />

      {/* Divisional → Conference connections */}
      <path
        d="M 50% 35%, L 60% 35%, L 60% 50%, L 75% 50%"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M 50% 65%, L 60% 65%, L 60% 50%, L 75% 50%"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />

      {/* Conference → Super Bowl */}
      <path
        d="M 75% 50%, L 90% 50%"
        stroke="#475569"
        strokeWidth="2"
        fill="none"
        opacity="0.3"
      />
    </svg>
  );
}

interface MatchupCardProps {
  matchup: PlayoffMatchup;
  compact?: boolean;
}

function MatchupCard({ matchup, compact }: MatchupCardProps) {
  const isLive = matchup.status === 'in_progress';

  return (
    <div className={`bg-slate-800 rounded-lg ${compact ? 'p-2' : 'p-3'} border ${isLive ? 'border-green-500/50' : 'border-slate-700'} relative z-10`}>
      {/* Away Team */}
      <TeamRow
        team={matchup.awayTeam}
        isWinner={matchup.winner === 'away'}
        status={matchup.status}
        compact={compact}
      />

      {/* Divider */}
      <div className="h-px bg-slate-700 my-1"></div>

      {/* Home Team */}
      <TeamRow
        team={matchup.homeTeam}
        isWinner={matchup.winner === 'home'}
        status={matchup.status}
        compact={compact}
      />

      {/* Game Status */}
      {isLive && (
        <div className="mt-1 text-center">
          <span className="text-[10px] text-green-400 font-semibold">● LIVE</span>
        </div>
      )}
    </div>
  );
}

interface TeamRowProps {
  team: PlayoffTeam | null;
  isWinner: boolean;
  status: 'scheduled' | 'in_progress' | 'final';
  compact?: boolean;
}

function TeamRow({ team, isWinner, status, compact }: TeamRowProps) {
  if (!team) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'py-0.5' : 'py-1'}`}>
        <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-slate-700 rounded`}></div>
        <div className="flex-1">
          <span className="text-white/30 text-xs">TBD</span>
        </div>
      </div>
    );
  }

  const isComplete = status === 'final';
  const opacity = isComplete && !isWinner ? 'opacity-40' : '';

  return (
    <div className={`flex items-center gap-2 ${compact ? 'py-0.5' : 'py-1'} ${opacity}`}>
      {/* Team Logo */}
      <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} flex-shrink-0`}>
        <img
          src={team.logo}
          alt={team.abbreviation}
          className="w-full h-full object-contain"
          onError={(e) => {
            e.currentTarget.src = '/images/tbd-logo.svg';
          }}
        />
      </div>

      {/* Team Info */}
      <div className="flex-1 min-w-0 flex items-center gap-1">
        {team.seed && (
          <span className="text-[10px] text-white/40">#{team.seed}</span>
        )}
        <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold ${isWinner ? 'text-white' : 'text-white/70'} truncate`}>
          {team.abbreviation}
        </span>
      </div>

      {/* Score */}
      {team.score !== undefined && (
        <div className={`${compact ? 'text-base' : 'text-lg'} font-bold tabular-nums ${isWinner ? 'text-white' : 'text-white/50'}`}>
          {team.score}
        </div>
      )}
    </div>
  );
}

function SuperBowlMatchup({ matchup }: { matchup: PlayoffMatchup | null }) {
  if (!matchup) {
    return (
      <div className="max-w-md mx-auto bg-gradient-to-br from-yellow-900/20 to-slate-800/50 rounded-lg p-6 border-2 border-yellow-600/30">
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold text-yellow-400/60">Super Bowl</h3>
          <p className="text-white/30 text-sm mt-1">To Be Determined</p>
        </div>
      </div>
    );
  }

  const isLive = matchup.status === 'in_progress';

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-yellow-900/30 to-slate-800 rounded-lg p-6 border-2 border-yellow-600/50">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-yellow-400">Super Bowl</h3>
        {matchup.venue && (
          <p className="text-white/50 text-xs mt-1">{matchup.venue}</p>
        )}
      </div>

      <div className="space-y-3">
        {/* Away Team */}
        <TeamRow
          team={matchup.awayTeam}
          isWinner={matchup.winner === 'away'}
          status={matchup.status}
        />

        <div className="text-center text-white/40 text-sm font-semibold">VS</div>

        {/* Home Team */}
        <TeamRow
          team={matchup.homeTeam}
          isWinner={matchup.winner === 'home'}
          status={matchup.status}
        />
      </div>

      {/* Game Status */}
      {isLive && (
        <div className="mt-4 text-center">
          <span className="text-sm text-green-400 font-semibold">● LIVE</span>
        </div>
      )}
    </div>
  );
}

// Helper function to create placeholder matchup for TBD games
function createPlaceholderMatchup(
  round: PlayoffMatchup['round'],
  conference: 'AFC' | 'NFC',
  index: number
): PlayoffMatchup {
  return {
    id: `placeholder-${conference}-${round}-${index}`,
    round,
    conference: conference === 'AFC' ? 'AFC' : 'NFC',
    homeTeam: null,
    awayTeam: null,
    status: 'scheduled',
  };
}

// Helper function to build playoff bracket from games
function buildPlayoffBracket(games: NFLGame[], currentGame: NFLGame): PlayoffBracket {
  const playoffGames = games.filter(g => g.seasonType === 3);

  // Group games by round
  const wildCardGames = playoffGames.filter(g => g.week === 1);
  const divisionalGames = playoffGames.filter(g => g.week === 2);
  const conferenceGames = playoffGames.filter(g => g.week === 3);
  const superBowlGames = playoffGames.filter(g => g.week === 5);

  // Determine current round based on week
  let currentRound: PlayoffBracket['currentRound'] = 'wild_card';
  if (currentGame.week === 2) currentRound = 'divisional';
  else if (currentGame.week === 3) currentRound = 'conference';
  else if (currentGame.week === 5) currentRound = 'super_bowl';

  return {
    season: currentGame.startTime ? new Date(currentGame.startTime).getFullYear() : new Date().getFullYear(),
    week: currentGame.week || 1,
    currentRound,
    afc: {
      wildCard: wildCardGames.filter(g => isAFCGame(g)).map(gameToMatchup).sort((a, b) => {
        // Sort by seed if available
        const aSeed = Math.min(a.homeTeam?.seed || 999, a.awayTeam?.seed || 999);
        const bSeed = Math.min(b.homeTeam?.seed || 999, b.awayTeam?.seed || 999);
        return aSeed - bSeed;
      }),
      divisional: divisionalGames.filter(g => isAFCGame(g)).map(gameToMatchup),
      conference: conferenceGames.find(g => isAFCGame(g)) ? gameToMatchup(conferenceGames.find(g => isAFCGame(g))!) : null,
    },
    nfc: {
      wildCard: wildCardGames.filter(g => !isAFCGame(g)).map(gameToMatchup).sort((a, b) => {
        const aSeed = Math.min(a.homeTeam?.seed || 999, a.awayTeam?.seed || 999);
        const bSeed = Math.min(b.homeTeam?.seed || 999, b.awayTeam?.seed || 999);
        return aSeed - bSeed;
      }),
      divisional: divisionalGames.filter(g => !isAFCGame(g)).map(gameToMatchup),
      conference: conferenceGames.find(g => !isAFCGame(g)) ? gameToMatchup(conferenceGames.find(g => !isAFCGame(g))!) : null,
    },
    superBowl: superBowlGames[0] ? gameToMatchup(superBowlGames[0]) : null,
  };
}

// Check if game involves AFC teams
function isAFCGame(game: NFLGame): boolean {
  const afcTeams = [
    'BAL', 'BUF', 'CIN', 'CLE', 'DEN', 'HOU', 'IND', 'JAX',
    'KC', 'LV', 'LAC', 'MIA', 'NE', 'NYJ', 'PIT', 'TEN'
  ];

  return afcTeams.includes(game.homeTeam.abbreviation) || afcTeams.includes(game.awayTeam.abbreviation);
}

// Convert NFLGame to PlayoffMatchup
function gameToMatchup(game: NFLGame): PlayoffMatchup {
  let round: PlayoffMatchup['round'] = 'wild_card';
  if (game.week === 2) round = 'divisional';
  else if (game.week === 3) round = 'conference';
  else if (game.week === 5) round = 'super_bowl';

  const conference: PlayoffMatchup['conference'] =
    game.week === 5 ? 'CHAMPIONSHIP' :
    isAFCGame(game) ? 'AFC' : 'NFC';

  const homeTeam: PlayoffTeam = {
    id: game.homeTeam.id,
    name: game.homeTeam.name,
    abbreviation: game.homeTeam.abbreviation,
    logo: game.homeTeam.logo,
    color: game.homeTeam.color,
    score: game.homeTeam.score,
  };

  const awayTeam: PlayoffTeam = {
    id: game.awayTeam.id,
    name: game.awayTeam.name,
    abbreviation: game.awayTeam.abbreviation,
    logo: game.awayTeam.logo,
    color: game.awayTeam.color,
    score: game.awayTeam.score,
  };

  let winner: 'home' | 'away' | undefined;
  if (game.status === 'final') {
    if (game.homeTeam.score > game.awayTeam.score) winner = 'home';
    else if (game.awayTeam.score > game.homeTeam.score) winner = 'away';
  }

  return {
    id: game.id,
    round,
    conference,
    homeTeam,
    awayTeam,
    winner,
    status: game.status as 'scheduled' | 'in_progress' | 'final',
    startTime: game.startTime,
    venue: game.venue,
  };
}

function getRoundDisplayName(round: PlayoffBracket['currentRound']): string {
  switch (round) {
    case 'wild_card':
      return 'Wild Card Round';
    case 'divisional':
      return 'Divisional Round';
    case 'conference':
      return 'Conference Championships';
    case 'super_bowl':
      return 'Super Bowl';
    default:
      return 'Playoffs';
  }
}
