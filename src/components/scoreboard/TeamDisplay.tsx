import type { Team } from '../../types/game';

interface TeamDisplayProps {
  team: Team;
  isHome: boolean;
}

export function TeamDisplay({ team, isHome }: TeamDisplayProps) {
  return (
    <div className={`flex flex-col items-center gap-4 ${isHome ? 'order-2' : 'order-0'}`}>
      {/* Team Logo with Glow Effect */}
      <div 
        className="relative w-44 h-44 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105"
        style={{
          background: `radial-gradient(circle, #${team.color}50 0%, #${team.color}20 50%, transparent 70%)`,
          boxShadow: `
            0 0 60px #${team.color}50,
            0 0 100px #${team.color}30,
            inset 0 0 30px #${team.color}20
          `,
        }}
      >
        {/* Outer ring with glow */}
        <div 
          className="absolute inset-2 rounded-full"
          style={{
            border: `4px solid #${team.color}`,
            boxShadow: `
              0 0 20px #${team.color}80,
              inset 0 0 20px #${team.color}40
            `,
          }}
        />
        
        {/* Inner glow ring */}
        <div 
          className="absolute inset-4 rounded-full opacity-50"
          style={{
            border: `2px solid #${team.alternateColor || 'ffffff'}`,
          }}
        />
        
        <img
          src={team.logo}
          alt={team.displayName}
          className="w-28 h-28 object-contain drop-shadow-2xl relative z-10"
          style={{
            filter: `drop-shadow(0 0 15px #${team.color}80)`,
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <div className="hidden absolute inset-0 flex items-center justify-center text-5xl font-black text-white z-10">
          {team.abbreviation}
        </div>
      </div>

      {/* Team Name with fancy styling */}
      <div className="relative">
        {/* Glow background */}
        <div 
          className="absolute inset-0 blur-xl opacity-60 rounded-lg"
          style={{ backgroundColor: `#${team.color}` }}
        />
        
        {/* Name container */}
        <div 
          className="relative px-6 py-2 rounded-lg border-2"
          style={{
            background: `linear-gradient(180deg, #${team.color}dd 0%, #${team.color}99 100%)`,
            borderColor: `#${team.alternateColor || team.color}`,
            boxShadow: `0 4px 20px #${team.color}60`,
          }}
        >
          <span 
            className="text-2xl font-black text-white uppercase tracking-widest"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 0 20px rgba(255,255,255,0.3)',
            }}
          >
            {team.shortDisplayName}
          </span>
        </div>
      </div>
    </div>
  );
}
