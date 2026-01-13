import { useSettingsStore } from '../../stores/settingsStore';
import { useCurrentPlugin } from '../../hooks/usePlugin';
import type { CompetitionType } from '../../types/base';

export function CompetitionSelector() {
  const currentCompetition = useSettingsStore((state) => state.currentCompetition);
  const setCompetition = useSettingsStore((state) => state.setCompetition);
  const plugin = useCurrentPlugin();

  // Only show competition selector if current plugin has multiple competitions
  const competitions = plugin?.manifest.competitions || [];
  if (competitions.length <= 1) {
    return null; // NFL only has one competition, so hide this section
  }

  return (
    <section className="bg-slate-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Wettbewerb</h3>
      <p className="text-white/50 text-sm mb-4">
        Wähle den Wettbewerb für {plugin?.manifest.displayName}
      </p>
      <div className="flex gap-3">
        {competitions.map((competition) => {
          const isActive = currentCompetition === competition;
          const displayName = competition === 'bundesliga'
            ? 'Bundesliga'
            : competition === 'dfb-pokal'
            ? 'DFB-Pokal'
            : competition;

          return (
            <button
              key={competition}
              onClick={() => setCompetition(competition as CompetitionType)}
              disabled={isActive}
              className={`
                flex-1 py-3 px-4 rounded-lg font-medium transition-all
                ${isActive
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-slate-700 text-white/70 hover:bg-slate-600'}
              `}
            >
              {displayName}
            </button>
          );
        })}
      </div>
    </section>
  );
}
