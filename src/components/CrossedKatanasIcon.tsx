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
          d="M 48 20 L 48 75 L 52 75 L 52 20 Z" 
          fill="currentColor"
          opacity="0.9"
        />
        {/* Blade tip */}
        <path 
          d="M 48 20 L 50 15 L 52 20 Z" 
          fill="currentColor"
        />
        {/* Guard (tsuba) */}
        <rect 
          x="45" 
          y="74" 
          width="10" 
          height="3" 
          fill="currentColor"
          rx="1"
        />
        {/* Handle (tsuka) */}
        <rect 
          x="47" 
          y="77" 
          width="6" 
          height="12" 
          fill="currentColor"
          opacity="0.8"
          rx="1"
        />
        {/* Pommel */}
        <circle 
          cx="50" 
          cy="90" 
          r="2" 
          fill="currentColor"
        />
      </g>

      {/* Right Katana (bottom to top, angled right) */}
      <g transform="rotate(45 50 50)">
        {/* Blade */}
        <path 
          d="M 48 20 L 48 75 L 52 75 L 52 20 Z" 
          fill="currentColor"
          opacity="0.9"
        />
        {/* Blade tip */}
        <path 
          d="M 48 20 L 50 15 L 52 20 Z" 
          fill="currentColor"
        />
        {/* Guard (tsuba) */}
        <rect 
          x="45" 
          y="74" 
          width="10" 
          height="3" 
          fill="currentColor"
          rx="1"
        />
        {/* Handle (tsuka) */}
        <rect 
          x="47" 
          y="77" 
          width="6" 
          height="12" 
          fill="currentColor"
          opacity="0.8"
          rx="1"
        />
        {/* Pommel */}
        <circle 
          cx="50" 
          cy="90" 
          r="2" 
          fill="currentColor"
        />
      </g>
    </svg>
  )
}
