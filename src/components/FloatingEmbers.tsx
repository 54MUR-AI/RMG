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
}

export default function FloatingEmbers() {
  const [embers, setEmbers] = useState<Ember[]>([])

  useEffect(() => {
    // Generate random embers
    const emberCount = 20
    const newEmbers: Ember[] = []
    
    for (let i = 0; i < emberCount; i++) {
      newEmbers.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 6 + Math.random() * 10, // More variation in speed
        size: 3 + Math.random() * 7,
        drift: -30 + Math.random() * 60, // Random horizontal drift -30 to +30
        rotation: Math.random() * 360, // Random rotation
        opacity: 0.6 + Math.random() * 0.3, // Varying opacity
        horizontalMeander: -80 + Math.random() * 160, // Random horizontal meandering -80 to +80
        meanderSpeed: 2 + Math.random() * 3 // Random meander speed
      })
    }
    
    setEmbers(newEmbers)
    
    // Inject keyframes for each ember
    const styleSheet = document.createElement('style')
    styleSheet.textContent = newEmbers.map(ember => `
      @keyframes floatEmber${ember.id} {
        0% {
          transform: translateY(0) translateX(0) rotate(0deg) scale(1);
          opacity: 0;
        }
        5% {
          opacity: 1;
        }
        12.5% {
          transform: translateY(-12.5vh) translateX(${ember.horizontalMeander * 0.15}px) rotate(${ember.rotation * 0.15}deg) scale(1.05);
        }
        25% {
          transform: translateY(-25vh) translateX(${ember.horizontalMeander * 0.4}px) rotate(${ember.rotation * 0.3}deg) scale(1.1);
        }
        37.5% {
          transform: translateY(-37.5vh) translateX(${ember.horizontalMeander * 0.7}px) rotate(${ember.rotation * 0.45}deg) scale(1.0);
        }
        50% {
          transform: translateY(-50vh) translateX(${ember.horizontalMeander * 0.85}px) rotate(${ember.rotation * 0.6}deg) scale(0.9);
        }
        62.5% {
          transform: translateY(-62.5vh) translateX(${ember.horizontalMeander * 0.7}px) rotate(${ember.rotation * 0.75}deg) scale(0.8);
        }
        75% {
          transform: translateY(-75vh) translateX(${ember.horizontalMeander * 0.4}px) rotate(${ember.rotation * 0.9}deg) scale(0.7);
        }
        87.5% {
          transform: translateY(-87.5vh) translateX(${ember.horizontalMeander * 0.15}px) rotate(${ember.rotation * 0.95}deg) scale(0.5);
        }
        95% {
          opacity: 0.8;
        }
        100% {
          transform: translateY(-100vh) translateX(0px) rotate(${ember.rotation}deg) scale(0.3);
          opacity: 0;
        }
      }
      
      @keyframes emberPulseGlow${ember.id} {
        0%, 100% {
          filter: brightness(1) saturate(1);
          box-shadow: 0 0 ${ember.size * 3}px rgba(230, 57, 70, 1), 0 0 ${ember.size * 6}px rgba(230, 57, 70, 0.6);
        }
        50% {
          filter: brightness(1.8) saturate(0.5);
          box-shadow: 0 0 ${ember.size * 6}px rgba(255, 200, 200, 1), 0 0 ${ember.size * 12}px rgba(255, 150, 150, 0.8), 0 0 ${ember.size * 18}px rgba(230, 57, 70, 0.4);
        }
      }
    `).join('\n')
    document.head.appendChild(styleSheet)
    
    return () => {
      document.head.removeChild(styleSheet)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute bottom-0"
          style={{
            left: `${ember.left}%`,
            animation: `floatEmber${ember.id} ${ember.duration}s ease-in-out ${ember.delay}s infinite`,
            zIndex: 0,
          }}
        >
          <div
            className="rounded-full bg-samurai-red blur-[1px]"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              opacity: ember.opacity,
              animation: `emberFlickerChaotic ${1 + Math.random() * 2}s ease-in-out infinite, emberPulseGlow${ember.id} ${2 + Math.random()}s ease-in-out infinite`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
