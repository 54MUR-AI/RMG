interface KatanaUnderlineProps {
  width?: number
  className?: string
}

export default function KatanaUnderline({ width = 200, className = '' }: KatanaUnderlineProps) {
  return (
    <svg
      width={width}
      height="8"
      viewBox="0 0 200 8"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Horizontal katana blade */}
      <path 
        d="M 2 4 L 198 4" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      
      {/* Blade edge detail */}
      <path 
        d="M 10 3.5 L 190 3.5" 
        stroke="currentColor" 
        strokeWidth="0.5" 
        opacity="0.6"
      />
      
      {/* Handle (tsuka) on left */}
      <rect 
        x="0" 
        y="2" 
        width="8" 
        height="4" 
        fill="currentColor" 
        rx="1"
      />
      
      {/* Guard (tsuba) */}
      <circle 
        cx="8" 
        cy="4" 
        r="2.5" 
        fill="currentColor" 
        stroke="currentColor" 
        strokeWidth="0.5"
      />
      
      {/* Blade tip (kissaki) on right */}
      <path 
        d="M 198 4 L 200 4 L 199 3 Z" 
        fill="currentColor"
      />
      <path 
        d="M 198 4 L 200 4 L 199 5 Z" 
        fill="currentColor"
      />
    </svg>
  )
}
