import type { GameSituation as GameSituationType, Team } from '../../types/game';

interface GameSituationProps {
  situation: GameSituationType;
  homeTeam: Team;
  awayTeam: Team;
}

export function GameSituation({ situation, homeTeam, awayTeam }: GameSituationProps) {
  const possessionTeam = situation.possession === homeTeam.id ? homeTeam : awayTeam;
  
  // Format down and distance
  const getDownText = () => {
    // Valid down (1-4): show formatted down & distance
    if (situation.down >= 1 && situation.down <= 4) {
      const downNames = ['', '1st', '2nd', '3rd', '4th'];
      const down = downNames[situation.down];

      // Show "Goal" when distance is 0
      if (situation.distance === 0) {
        return `${down} & Goal`;
      }

      return `${down} & ${situation.distance}`;
    }

    // Fallback to ESPN's shortDownDistanceText (e.g., "1st & 10")
    if (situation.shortDownDistanceText) {
      return situation.shortDownDistanceText;
    }

    // Fallback to last play type (e.g., "Kickoff", "Punt", "PAT")
    if (situation.lastPlayType) {
      return situation.lastPlayType;
    }

    return '';
  };

  // Format field position
  const getFieldPosition = () => {
    // Use ESPN's possessionText which includes team side (e.g., "PHI 35", "SF 20")
    if (situation.possessionText) {
      return situation.possessionText;
    }

    // Fallback to raw yardLine if possessionText not available
    if (!situation.yardLine) return '';

    if (situation.yardLine === 50) {
      return 'Midfield';
    }

    return `${situation.yardLine} yard line`;
  };

  return (
    <div className="flex items-center gap-4 bg-black/20 rounded-lg px-6 py-3">
      {/* Possession indicator */}
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `#${possessionTeam.color}` }}
        >
          <span className="text-xs font-bold text-white">
            {possessionTeam.abbreviation}
          </span>
        </div>
        <span className="text-white/80 text-sm">BALL</span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20"></div>

      {/* Down & Distance */}
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-white">
          {getDownText()}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-8 bg-white/20"></div>

      {/* Field Position */}
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="text-white/80">
          {getFieldPosition()}
        </span>
      </div>

      {/* Red Zone indicator */}
      {situation.isRedZone && (
        <>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="flex items-center gap-1 bg-red-600 px-3 py-1 rounded-full">
            <span className="text-white text-sm font-bold">RED ZONE</span>
          </div>
        </>
      )}
    </div>
  );
}
