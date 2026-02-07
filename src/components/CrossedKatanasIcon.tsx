export default function CrossedKatanasIcon({ 
  size = 48, 
  className = "" 
}: { 
  size?: number; 
  className?: string 
}) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left Katana (bottom to top, angled left) */}
      <g transform="rotate(-45 50 50)">
        {/* Blade */}
        <path 
          d="M 47 20 L 47 75 L 53 75 L 53 20 Z" 
          fill="currentColor"
          opacity="0.9"
        />
        {/* Blade tip */}
        <path 
          d="M 47 20 L 50 15 L 53 20 Z" 
          fill="currentColor"
        />
        {/* Guard (tsuba) */}
        <rect 
          x="44" 
          y="74" 
          width="12" 
          height="4" 
          fill="currentColor"
          rx="1"
        />
        {/* Handle (tsuka) */}
        <rect 
          x="46" 
          y="78" 
          width="8" 
          height="12" 
          fill="currentColor"
          opacity="0.8"
          rx="1"
        />
        {/* Pommel */}
        <circle 
          cx="50" 
          cy="91" 
          r="2.5" 
          fill="currentColor"
        />
      </g>

      {/* Right Katana (bottom to top, angled right) */}
      <g transform="rotate(45 50 50)">
        {/* Blade */}
        <path 
          d="M 47 20 L 47 75 L 53 75 L 53 20 Z" 
          fill="currentColor"
          opacity="0.9"
        />
        {/* Blade tip */}
        <path 
          d="M 47 20 L 50 15 L 53 20 Z" 
          fill="currentColor"
        />
        {/* Guard (tsuba) */}
        <rect 
          x="44" 
          y="74" 
          width="12" 
          height="4" 
          fill="currentColor"
          rx="1"
        />
        {/* Handle (tsuka) */}
        <rect 
          x="46" 
          y="78" 
          width="8" 
          height="12" 
          fill="currentColor"
          opacity="0.8"
          rx="1"
        />
        {/* Pommel */}
        <circle 
          cx="50" 
          cy="91" 
          r="2.5" 
          fill="currentColor"
        />
      </g>
    </svg>
  )
}
