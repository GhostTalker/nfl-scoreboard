import { useEffect, useState } from 'react';
import type { LiveTableEntry } from '../../types/bundesliga';
import type { Game } from '../../types/game';
import { fetchBundesligaTable, calculateLiveTable, getPositionZone } from '../../services/bundesligaTable';
import { getBestLogoUrl } from '../../utils/logoFallback';

interface LiveTableProps {
  currentGames: Game[];
  season?: number;
}

export function LiveTable({ currentGames, season = 2024 }: LiveTableProps) {
  const [liveTable, setLiveTable] = useState<LiveTableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTable() {
      try {
        setLoading(true);
        setError(null);
        const officialTable = await fetchBundesligaTable(season);
        const calculatedTable = calculateLiveTable(officialTable, currentGames);
        setLiveTable(calculatedTable);
      } catch (err) {
        console.error('Error loading table:', err);
        setError('Tabelle konnte nicht geladen werden');
      } finally {
        setLoading(false);
      }
    }

    loadTable();
  }, [currentGames, season]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white/60 text-lg">Tabelle wird geladen...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-400 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-900/50 rounded-lg p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white mb-1">⚡ Blitztabelle</h2>
        <p className="text-sm text-white/60">Live-Tabelle basierend auf aktuellen Spielständen</p>
      </div>

      <div className="space-y-1">
        {liveTable.map((entry) => {
          const zone = getPositionZone(entry.position);
          const hasPositionChange = entry.previousPosition !== entry.position;
          const positionChange = hasPositionChange
            ? entry.previousPosition! - entry.position
            : 0;
          const hasLivePoints = entry.livePoints !== entry.points;

          return (
            <div
              key={entry.teamId}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                hasLivePoints ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-slate-800/50'
              }`}
              style={{
                borderLeftWidth: '4px',
                borderLeftColor: zone.color,
              }}
            >
              {/* Position */}
              <div className="flex items-center gap-2 w-12">
                <span className="text-lg font-bold text-white">{entry.position}</span>
                {hasPositionChange && (
                  <span
                    className={`text-xs ${
                      positionChange > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {positionChange > 0 ? `↑${positionChange}` : `↓${Math.abs(positionChange)}`}
                  </span>
                )}
              </div>

              {/* Team Logo */}
              <div className="w-8 h-8 flex-shrink-0">
                <img
                  src={getBestLogoUrl(entry.teamIconUrl, entry.teamName)}
                  alt={entry.shortName}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/images/tbd-logo.svg';
                  }}
                />
              </div>

              {/* Team Name */}
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium truncate">{entry.teamName}</div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm">
                {/* Games */}
                <div className="text-white/60 w-8 text-center">{entry.played}</div>

                {/* Goal Difference */}
                <div
                  className={`w-12 text-center font-mono ${
                    entry.liveGoalDifference > 0
                      ? 'text-green-400'
                      : entry.liveGoalDifference < 0
                      ? 'text-red-400'
                      : 'text-white/60'
                  }`}
                >
                  {entry.liveGoalDifference > 0 ? '+' : ''}
                  {entry.liveGoalDifference}
                </div>

                {/* Points */}
                <div className="w-16 text-right">
                  {hasLivePoints ? (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-white/40 line-through text-xs">
                        {entry.points}
                      </span>
                      <span className="text-blue-400 font-bold">{entry.livePoints}</span>
                    </div>
                  ) : (
                    <span className="text-white font-bold">{entry.points}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="text-xs text-white/40 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#0066CC' }}></div>
            <span>Champions League (1-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FF6600' }}></div>
            <span>Europa League (5)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#00CC66' }}></div>
            <span>Europa Conference League (6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#FFAA00' }}></div>
            <span>Relegation (16)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: '#CC0000' }}></div>
            <span>Abstieg (17-18)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
