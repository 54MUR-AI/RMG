interface KatanaIconProps {
  size?: number
  className?: string
}

export default function KatanaIcon({ size = 24, className = '' }: KatanaIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Blade - curved katana blade */}
      <path d="M3 21 L21 3" strokeWidth="1.5" />
      <path d="M4 20 Q12 12 20 4" strokeWidth="2.5" fill="none" />
      
      {/* Tsuba (guard) - circular guard */}
      <circle cx="6.5" cy="17.5" r="1.8" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
      
      {/* Tsuka (handle) - wrapped handle */}
      <line x1="3" y1="21" x2="6.5" y2="17.5" strokeWidth="3" strokeLinecap="round" />
      
      {/* Handle wrap detail */}
      <line x1="3.8" y1="20.2" x2="4.2" y2="19.8" strokeWidth="0.5" opacity="0.6" />
      <line x1="4.5" y1="19.5" x2="4.9" y2="19.1" strokeWidth="0.5" opacity="0.6" />
      <line x1="5.2" y1="18.8" x2="5.6" y2="18.4" strokeWidth="0.5" opacity="0.6" />
      
      {/* Kissaki (blade tip) - pointed tip */}
      <path d="M20 4 L21 3 L20.5 3.5 Z" fill="currentColor" />
      
      {/* Habaki (blade collar) - small detail near guard */}
      <rect x="7.2" y="16.2" width="0.8" height="0.8" fill="currentColor" opacity="0.7" transform="rotate(-45 7.6 16.6)" />
    </svg>
  )
}
