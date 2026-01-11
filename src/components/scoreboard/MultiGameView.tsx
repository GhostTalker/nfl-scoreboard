import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';
import { getTitleGraphic } from '../../constants/titleGraphics';
import type { Game } from '../../types/game';

export function MultiGameView() {
  const availableGames = useGameStore((state) => state.availableGames);
  const confirmGameSelection = useGameStore((state) => state.confirmGameSelection);
  const setViewMode = useSettingsStore((state) => state.setViewMode);

  // Group games by status
  const liveGames = availableGames.filter(g => g.status === 'in_progress' || g.status === 'halftime');
  const scheduledGames = availableGames.filter(g => g.status === 'scheduled');
  const finishedGames = availableGames.filter(g => g.status === 'final');

  // Combine all games with live first, then scheduled, then finished
  const allGames = [...liveGames, ...scheduledGames, ...finishedGames];

  // Get the season name from the first game for the header
  const seasonName = allGames[0]?.seasonName || 'GAME DAY';
  const titleGraphic = getTitleGraphic(seasonName);

  const handleSelectGame = (game: Game) => {
    confirmGameSelection(game);
    setViewMode('single');
  };

  if (allGames.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900">
        <p className="text-white/50 text-xl">Keine Spiele verfügbar</p>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full flex flex-col overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse at top, #1a2744 0%, transparent 50%),
          radial-gradient(ellipse at bottom, #0d1f3c 0%, transparent 50%),
          linear-gradient(180deg, #0a1628 0%, #152238 50%, #0a1628 100%)
        `,
      }}
    >
      {/* Title Graphic Header */}
      <div className="flex-shrink-0 pt-4 pb-2 flex justify-center">
        {titleGraphic && (
          <img
            src={titleGraphic}
            alt={seasonName}
            className="h-24 w-auto object-contain drop-shadow-2xl"
            style={{
              filter: 'drop-shadow(0 6px 15px rgba(0,0,0,0.7))',
            }}
          />
        )}
      </div>

      {/* Games Grid - 2 columns */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto">
          {allGames.map((game) => (
            <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface GameCardProps {
  game: Game;
  onSelect: (game: Game) => void;
}

function GameCard({ game, onSelect }: GameCardProps) {
  const isLive = game.status === 'in_progress' || game.status === 'halftime';
  const isFinal = game.status === 'final';
  const isScheduled = game.status === 'scheduled';
  const isHalftime = game.status === 'halftime';

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return 'HEUTE';
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'MORGEN';
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
    }).toUpperCase();
  };

  // Get background style based on game status
  const getCardStyle = () => {
    if (isLive) {
      return {
        background: `
          radial-gradient(ellipse at top, rgba(220,38,38,0.3) 0%, transparent 60%),
          linear-gradient(180deg, rgba(30,15,15,0.95) 0%, rgba(20,10,10,0.98) 100%)
        `,
        border: '2px solid rgba(220,38,38,0.5)',
        boxShadow: '0 0 40px rgba(220,38,38,0.2), 0 8px 32px rgba(0,0,0,0.4)',
      };
    }
    if (isFinal) {
      return {
        background: 'linear-gradient(180deg, rgba(30,35,45,0.95) 0%, rgba(20,25,35,0.98) 100%)',
        border: '2px solid rgba(100,100,120,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      };
    }
    // Scheduled
    return {
      background: 'linear-gradient(180deg, rgba(25,35,55,0.95) 0%, rgba(15,25,45,0.98) 100%)',
      border: '2px solid rgba(59,130,246,0.3)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    };
  };

  return (
    <button
      onClick={() => onSelect(game)}
      className="rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] text-left"
      style={getCardStyle()}
    >
      {/* Status Badge */}
      <div className="flex justify-center mb-4">
        {isLive && !isHalftime && (
          <div
            className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wider bg-red-600/90 text-white"
            style={{ boxShadow: '0 0 20px rgba(220,38,38,0.5)' }}
          >
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              {game.clock.periodName} {game.clock.displayValue}
            </span>
          </div>
        )}
        {isHalftime && (
          <div
            className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wider"
            style={{
              background: 'linear-gradient(180deg, rgba(234,179,8,0.8) 0%, rgba(202,138,4,0.6) 100%)',
              boxShadow: '0 0 15px rgba(234,179,8,0.3)',
            }}
          >
            <span className="text-white">HALFTIME</span>
          </div>
        )}
        {isFinal && (
          <div className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wider bg-gray-600/80 text-white/90">
            FINAL
          </div>
        )}
        {isScheduled && (
          <div className="px-4 py-1.5 rounded-full text-sm font-bold tracking-wider bg-blue-600/80 text-white/90">
            {formatDate(game.startTime)} {formatTime(game.startTime)}
          </div>
        )}
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between gap-4">
        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={game.awayTeam.logo}
            alt={game.awayTeam.abbreviation}
            className="w-16 h-16 object-contain mb-2"
          />
          <span className="text-white font-bold text-lg">
            {game.awayTeam.abbreviation}
          </span>
          {!isScheduled && (
            <span
              className={`text-4xl font-black mt-1 ${
                isFinal && game.awayTeam.score > game.homeTeam.score
                  ? 'text-white'
                  : isFinal
                  ? 'text-white/50'
                  : 'text-white'
              }`}
              style={{
                textShadow: `0 0 20px #${game.awayTeam.color}80`,
              }}
            >
              {game.awayTeam.score}
            </span>
          )}
        </div>

        {/* VS / Score Separator */}
        <div className="flex flex-col items-center gap-2">
          {isScheduled ? (
            <span className="text-white/30 text-2xl font-bold">@</span>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
            </>
          )}
        </div>

        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center">
          <img
            src={game.homeTeam.logo}
            alt={game.homeTeam.abbreviation}
            className="w-16 h-16 object-contain mb-2"
          />
          <span className="text-white font-bold text-lg">
            {game.homeTeam.abbreviation}
          </span>
          {!isScheduled && (
            <span
              className={`text-4xl font-black mt-1 ${
                isFinal && game.homeTeam.score > game.awayTeam.score
                  ? 'text-white'
                  : isFinal
                  ? 'text-white/50'
                  : 'text-white'
              }`}
              style={{
                textShadow: `0 0 20px #${game.homeTeam.color}80`,
              }}
            >
              {game.homeTeam.score}
            </span>
          )}
        </div>
      </div>

      {/* Venue for scheduled games */}
      {isScheduled && game.venue && (
        <div className="mt-3 text-center text-white/40 text-xs truncate">
          {game.venue}
        </div>
      )}
    </button>
  );
}
