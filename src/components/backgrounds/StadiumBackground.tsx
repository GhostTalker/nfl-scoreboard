// Professional NFL Broadcast-style Stadium Background
export function StadiumBackground({ variant }: { variant: 'superbowl' | 'championship' | 'playoffs' | 'live' | 'final' | 'default' }) {
  
  // Color schemes for different variants
  const getColors = () => {
    switch (variant) {
      case 'superbowl':
        return {
          sky: ['#1a1410', '#2d2416', '#1a1410'],
          accent: '#FFD700',
          glow: 'rgba(255, 215, 0, 0.3)',
          grass: ['#1a3a1f', '#2d4a2f', '#1a3a1f'],
        };
      case 'championship':
        return {
          sky: ['#1a1c20', '#252830', '#1a1c20'],
          accent: '#C0C0C0',
          glow: 'rgba(200, 200, 220, 0.25)',
          grass: ['#1a3a1f', '#2d4a2f', '#1a3a1f'],
        };
      case 'live':
        return {
          sky: ['#1a0a0a', '#2d1212', '#1a0a0a'],
          accent: '#DC2626',
          glow: 'rgba(220, 38, 38, 0.35)',
          grass: ['#1a3a1f', '#2d4a2f', '#1a3a1f'],
        };
      case 'playoffs':
        return {
          sky: ['#0a1628', '#1a2f4a', '#0a1628'],
          accent: '#3B82F6',
          glow: 'rgba(59, 130, 246, 0.3)',
          grass: ['#1a3a1f', '#2d4a2f', '#1a3a1f'],
        };
      case 'final':
        return {
          sky: ['#0a0e14', '#12161c', '#0a0e14'],
          accent: '#6B7280',
          glow: 'rgba(100, 100, 120, 0.2)',
          grass: ['#1a3a1f', '#2d4a2f', '#1a3a1f'],
        };
      default:
        return {
          sky: ['#0a1628', '#152238', '#0a1628'],
          accent: '#FFFFFF',
          glow: 'rgba(255, 255, 255, 0.15)',
          grass: ['#1a3a1f', '#2d4a2f', '#1a3a1f'],
        };
    }
  };

  const colors = getColors();

  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        {/* Sky gradient */}
        <linearGradient id={`sky-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.sky[0]} />
          <stop offset="50%" stopColor={colors.sky[1]} />
          <stop offset="100%" stopColor={colors.sky[2]} />
        </linearGradient>

        {/* Grass gradient */}
        <linearGradient id={`grass-${variant}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.grass[0]} />
          <stop offset="50%" stopColor={colors.grass[1]} />
          <stop offset="100%" stopColor={colors.grass[2]} />
        </linearGradient>

        {/* Grass pattern */}
        <pattern id={`grassPattern-${variant}`} x="0" y="0" width="40" height="100%" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="20" height="100%" fill="rgba(34, 139, 34, 0.15)" />
          <rect x="20" y="0" width="20" height="100%" fill="rgba(46, 125, 50, 0.12)" />
        </pattern>

        {/* Stadium light glow */}
        <radialGradient id={`lightGlow-${variant}`}>
          <stop offset="0%" stopColor={colors.accent} stopOpacity="0.8" />
          <stop offset="50%" stopColor={colors.accent} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
        </radialGradient>

        {/* Top atmospheric glow */}
        <radialGradient id={`atmosGlow-${variant}`} cx="50%" cy="0%">
          <stop offset="0%" stopColor={colors.glow.replace('rgba', 'rgb').replace(/, [\d.]+\)/, ')')} stopOpacity="0.4" />
          <stop offset="60%" stopColor={colors.glow.replace('rgba', 'rgb').replace(/, [\d.]+\)/, ')')} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sky background */}
      <rect width="100%" height="65%" fill={`url(#sky-${variant})`} />

      {/* Atmospheric top glow */}
      <ellipse cx="50%" cy="0%" rx="45%" ry="25%" fill={`url(#atmosGlow-${variant})`} />

      {/* Stadium lights - top row */}
      {[...Array(8)].map((_, i) => (
        <g key={`light-${i}`}>
          {/* Light fixture */}
          <circle 
            cx={`${(i * 12.5) + 6.25}%`} 
            cy="5%" 
            r="12" 
            fill={`url(#lightGlow-${variant})`}
            opacity="0.6"
          >
            <animate
              attributeName="opacity"
              values="0.5;0.8;0.5"
              dur={`${3 + (i * 0.2)}s`}
              repeatCount="indefinite"
            />
          </circle>
          {/* Light beam */}
          <polygon
            points={`${(i * 12.5) + 5.5}%,60 ${(i * 12.5) + 7}%,60 ${(i * 12.5) + 15}%,600 ${(i * 12.5) - 2}%,600`}
            fill={colors.accent}
            opacity="0.08"
          />
        </g>
      ))}

      {/* Crowd silhouettes - left side */}
      <path
        d="M 0 300 Q 100 280 200 300 Q 300 280 400 300 L 400 400 L 0 400 Z"
        fill="rgba(0, 0, 0, 0.6)"
        opacity="0.8"
      />

      {/* Crowd silhouettes - right side */}
      <path
        d="M 1520 300 Q 1620 280 1720 300 Q 1820 280 1920 300 L 1920 400 L 1520 400 Z"
        fill="rgba(0, 0, 0, 0.6)"
        opacity="0.8"
      />

      {/* Grass field */}
      <rect y="65%" width="100%" height="35%" fill={`url(#grass-${variant})`} />
      <rect y="65%" width="100%" height="35%" fill={`url(#grassPattern-${variant})`} />

      {/* Field yard lines */}
      <line x1="0" y1="70%" x2="100%" y2="70%" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" />
      <line x1="0" y1="75%" x2="100%" y2="75%" stroke="rgba(255, 255, 255, 0.25)" strokeWidth="4" />
      <line x1="0" y1="80%" x2="100%" y2="80%" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" />

      {/* Hash marks */}
      {[...Array(20)].map((_, i) => (
        <line
          key={`hash-${i}`}
          x1={`${i * 5}%`}
          y1="75%"
          x2={`${i * 5}%`}
          y2="75.5%"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="1"
        />
      ))}

      {/* Vignette effect */}
      <rect width="100%" height="100%" fill="url(#vignette)" />
      <radialGradient id="vignette">
        <stop offset="0%" stopColor="black" stopOpacity="0" />
        <stop offset="100%" stopColor="black" stopOpacity="0.4" />
      </radialGradient>
    </svg>
  );
}
