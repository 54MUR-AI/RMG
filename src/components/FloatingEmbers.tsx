import { useEffect, useState } from 'react'

interface Ember {
  id: number
  left: number
  delay: number
  duration: number
  size: number
  drift: number
  rotation: number
  opacity: number
  horizontalMeander: number
  meanderSpeed: number
  color: string
  changeRate: number
  depthLayer: number // 0=back, 1=mid, 2=front for parallax
  turbulencePhase: number // For wind gust synchronization
  burstGroup: number // For clustering effects
}

export default function FloatingEmbers() {
  const [embers, setEmbers] = useState<Ember[]>([])

  useEffect(() => {
    // Generate random embers - fewer on mobile for performance
    const isMobile = window.innerWidth < 768
    const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
    const emberCount = isMobile ? 12 : isTablet ? 25 : 40
    const newEmbers: Ember[] = []
    
    for (let i = 0; i < emberCount; i++) {
      // Size determines speed - bigger embers are slower (more mass)
      const size = 3 + Math.random() * 7
      const baseDuration = 12
      const maxDuration = 32
      // Map size (3-10) to duration: small=fast(12-20s), large=slow(20-32s)
      const sizeInfluence = (size - 3) / 7 // 0 to 1
      const duration = baseDuration + (sizeInfluence * (maxDuration - baseDuration)) + Math.random() * 8
      
      // Calculate rate of change (how much the ember changes per second)
      // Faster embers with more movement = higher change rate
      const horizontalMeander = -80 + Math.random() * 160
      const changeRate = (Math.abs(horizontalMeander) / 80) * (baseDuration / duration)
      
      // Map change rate to color: high rate = white-hot, low rate = deep red
      // changeRate ranges roughly 0-1.5
      const colorIntensity = Math.min(changeRate / 1.5, 1)
      const red = 230
      const green = Math.floor(57 + (colorIntensity * 198)) // 57 to 255
      const blue = Math.floor(70 + (colorIntensity * 185))  // 70 to 255
      const color = `rgb(${red}, ${green}, ${blue})`
      
      // Depth layering: distribute embers across 3 layers for parallax
      // Back layer (0): 30%, Mid layer (1): 50%, Front layer (2): 20%
      const depthRoll = Math.random()
      const depthLayer = depthRoll < 0.3 ? 0 : depthRoll < 0.8 ? 1 : 2
      
      // Turbulence phase: group embers into wind gust waves (0-3)
      const turbulencePhase = Math.floor(Math.random() * 4)
      
      // Burst grouping: occasional clusters (10% chance of being in a burst)
      const burstGroup = Math.random() < 0.1 ? Math.floor(Math.random() * 3) : -1
      
      newEmbers.push({
        id: i,
        left: 5 + Math.random() * 90,
        delay: Math.random() * duration,
        duration: duration,
        size: size,
        drift: -30 + Math.random() * 60,
        rotation: Math.random() * 360,
        opacity: 0.6 + Math.random() * 0.3,
        horizontalMeander: horizontalMeander,
        meanderSpeed: 2 + Math.random() * 3,
        color: color,
        changeRate: changeRate,
        depthLayer: depthLayer,
        turbulencePhase: turbulencePhase,
        burstGroup: burstGroup
      })
    }
    
    setEmbers(newEmbers)
    
    // Inject keyframes for each ember with enhanced realism
    const styleSheet = document.createElement('style')
    styleSheet.textContent = newEmbers.map(ember => {
      // Turbulence offset based on phase (creates wave-like wind gusts)
      const turbulenceOffset = ember.turbulencePhase * 25
      
      // Calculate color transitions: white-hot → orange → red → dark ash
      const startColor = ember.color // Initial color based on change rate
      const midColor = `rgb(230, ${Math.floor(57 + ember.changeRate * 80)}, 70)` // Orange phase
      const endColor = `rgb(180, 40, 50)` // Dark red/ash
      const ashColor = `rgb(60, 30, 30)` // Nearly black ash
      
      // Gravity effect: slight downward drift before updraft takes over
      const gravityDip = ember.size * 2 // Bigger embers dip more
      
      return `
      @keyframes floatEmber${ember.id} {
        0% {
          transform: translateY(0) translateX(0) rotate(0deg) scale(0.6);
          opacity: 0;
          filter: brightness(1.5);
        }
        3% {
          transform: translateY(${gravityDip}px) translateX(${turbulenceOffset * 0.1}px) rotate(${ember.rotation * 0.05}deg) scale(0.7);
          opacity: 0.8;
          filter: brightness(1.8);
        }
        8% {
          transform: translateY(-8vh) translateX(${ember.horizontalMeander * 0.15 + turbulenceOffset * 0.2}px) rotate(${ember.rotation * 0.1}deg) scale(0.85);
          opacity: 1;
          filter: brightness(1.5);
        }
        15% {
          transform: translateY(-15vh) translateX(${ember.horizontalMeander * 0.3 + turbulenceOffset * 0.4}px) rotate(${ember.rotation * 0.15}deg) scale(0.95);
          filter: brightness(1.3);
        }
        25% {
          transform: translateY(-25vh) translateX(${ember.horizontalMeander * 0.6 + turbulenceOffset * 0.6}px) rotate(${ember.rotation * 0.25}deg) scale(1.05);
          filter: brightness(1.1);
        }
        35% {
          transform: translateY(-35vh) translateX(${ember.horizontalMeander * 0.9 + turbulenceOffset * 0.7}px) rotate(${ember.rotation * 0.35}deg) scale(1.1);
          filter: brightness(1.0);
        }
        50% {
          transform: translateY(-50vh) translateX(${ember.horizontalMeander * 1.0 + turbulenceOffset}px) rotate(${ember.rotation * 0.5}deg) scale(1.0);
          filter: brightness(0.9);
        }
        65% {
          transform: translateY(-65vh) translateX(${ember.horizontalMeander * 0.7 + turbulenceOffset * 0.8}px) rotate(${ember.rotation * 0.65}deg) scale(0.85);
          filter: brightness(0.8);
        }
        75% {
          transform: translateY(-75vh) translateX(${ember.horizontalMeander * 0.4 + turbulenceOffset * 0.5}px) rotate(${ember.rotation * 0.75}deg) scale(0.7);
          filter: brightness(0.7);
        }
        85% {
          transform: translateY(-85vh) translateX(${ember.horizontalMeander * 0.1 + turbulenceOffset * 0.3}px) rotate(${ember.rotation * 0.85}deg) scale(0.5);
          opacity: 0.9;
          filter: brightness(0.6);
        }
        92% {
          transform: translateY(-92vh) translateX(${turbulenceOffset * 0.1}px) rotate(${ember.rotation * 0.92}deg) scale(0.35);
          opacity: 0.7;
          filter: brightness(0.4);
        }
        97% {
          transform: translateY(-100vh) translateX(0px) rotate(${ember.rotation}deg) scale(0.2);
          opacity: 0.3;
          filter: brightness(0.2);
        }
        100% {
          transform: translateY(-110vh) translateX(0px) rotate(${ember.rotation}deg) scale(0.1);
          opacity: 0;
          filter: brightness(0);
        }
      }
      
      @keyframes emberColorShift${ember.id} {
        0% { background-color: ${startColor}; }
        30% { background-color: ${startColor}; }
        60% { background-color: ${midColor}; }
        85% { background-color: ${endColor}; }
        100% { background-color: ${ashColor}; }
      }
      
      @keyframes emberFlicker${ember.id} {
        0%, 100% { opacity: ${ember.opacity}; }
        15% { opacity: ${ember.opacity * 1.4}; }
        30% { opacity: ${ember.opacity * 0.8}; }
        45% { opacity: ${ember.opacity * 1.2}; }
        60% { opacity: ${ember.opacity * 0.9}; }
        75% { opacity: ${ember.opacity * 1.3}; }
        90% { opacity: ${ember.opacity * 0.7}; }
      }
    `}).join('\n')
    document.head.appendChild(styleSheet)
    
    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
      {embers.map((ember) => {
        // Depth-based styling for parallax effect
        const depthOpacity = ember.depthLayer === 2 ? 1.0 : ember.depthLayer === 1 ? 0.85 : 0.7
        const depthBlur = ember.depthLayer === 0 ? 'blur(0.5px)' : 'none'
        const depthScale = ember.depthLayer === 2 ? 1.0 : ember.depthLayer === 1 ? 0.9 : 0.8
        
        // Performance optimization: simpler animations on mobile
        const isMobile = window.innerWidth < 1024
        const animations = isMobile
          ? `floatEmber${ember.id} ${ember.duration}s linear ${ember.delay}s infinite`
          : `floatEmber${ember.id} ${ember.duration}s linear ${ember.delay}s infinite, 
             emberColorShift${ember.id} ${ember.duration}s linear ${ember.delay}s infinite,
             emberFlicker${ember.id} ${1.5 + Math.random()}s ease-in-out infinite`
        
        return (
          <div
            key={ember.id}
            className="absolute"
            style={{
              left: `${ember.left}%`,
              bottom: '0px',
              zIndex: ember.depthLayer, // Layer ordering
              animation: `floatEmber${ember.id} ${ember.duration}s linear ${ember.delay}s infinite`,
            }}
          >
            <div
              className="rounded-full"
              style={{
                width: `${ember.size * depthScale}px`,
                height: `${ember.size * depthScale}px`,
                backgroundColor: ember.color,
                opacity: ember.opacity * depthOpacity,
                animation: animations,
                filter: depthBlur,
                willChange: 'transform, opacity',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
