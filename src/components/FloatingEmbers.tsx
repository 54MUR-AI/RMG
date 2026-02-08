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
        changeRate: changeRate
      })
    }
    
    setEmbers(newEmbers)
    
    // Inject keyframes for each ember
    const styleSheet = document.createElement('style')
    styleSheet.textContent = newEmbers.map(ember => `
      @keyframes floatEmber${ember.id} {
        0% {
          transform: translateY(0) translateX(0) rotate(0deg) scale(0.8);
          opacity: 0;
        }
        5% {
          opacity: 1;
        }
        10% {
          transform: translateY(-10vh) translateX(${ember.horizontalMeander * 0.2}px) rotate(${ember.rotation * 0.1}deg) scale(0.85);
        }
        20% {
          transform: translateY(-20vh) translateX(${ember.horizontalMeander * 0.5}px) rotate(${ember.rotation * 0.2}deg) scale(0.9);
        }
        30% {
          transform: translateY(-30vh) translateX(${ember.horizontalMeander * 0.8}px) rotate(${ember.rotation * 0.3}deg) scale(0.95);
        }
        40% {
          transform: translateY(-40vh) translateX(${ember.horizontalMeander * 1.0}px) rotate(${ember.rotation * 0.4}deg) scale(1.0);
        }
        50% {
          transform: translateY(-50vh) translateX(${ember.horizontalMeander * 0.8}px) rotate(${ember.rotation * 0.5}deg) scale(0.95);
        }
        60% {
          transform: translateY(-60vh) translateX(${ember.horizontalMeander * 0.5}px) rotate(${ember.rotation * 0.6}deg) scale(0.9);
        }
        70% {
          transform: translateY(-70vh) translateX(${ember.horizontalMeander * 0.2}px) rotate(${ember.rotation * 0.7}deg) scale(0.8);
        }
        80% {
          transform: translateY(-80vh) translateX(${ember.horizontalMeander * -0.2}px) rotate(${ember.rotation * 0.8}deg) scale(0.7);
        }
        90% {
          transform: translateY(-90vh) translateX(${ember.horizontalMeander * -0.4}px) rotate(${ember.rotation * 0.9}deg) scale(0.5);
        }
        98% {
          opacity: 1;
          transform: translateY(-105vh) translateX(0px) rotate(${ember.rotation}deg) scale(0.3);
        }
        100% {
          transform: translateY(-110vh) translateX(0px) rotate(${ember.rotation}deg) scale(0.2);
          opacity: 0;
        }
      }
      
      @keyframes emberPulseGlow${ember.id} {
        0%, 100% {
          opacity: ${ember.opacity};
        }
        50% {
          opacity: ${ember.opacity * 1.3};
        }
      }
    `).join('\n')
    document.head.appendChild(styleSheet)
    
    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 9999 }}>
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute"
          style={{
            left: `${ember.left}%`,
            bottom: '0px',
            animation: `floatEmber${ember.id} ${ember.duration}s linear ${ember.delay}s infinite`,
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              backgroundColor: ember.color,
              opacity: ember.opacity,
              animation: window.innerWidth < 1024
                ? `floatEmber${ember.id} ${ember.duration}s linear ${ember.delay}s infinite`
                : `emberFlickerChaotic ${1 + Math.random() * 2}s ease-in-out infinite, emberPulseGlow${ember.id} ${2 + Math.random()}s ease-in-out infinite`,
              willChange: 'transform',
            }}
          />
        </div>
      ))}
    </div>
  )
}
