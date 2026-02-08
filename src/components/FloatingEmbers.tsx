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
    // Generate random embers - fewer on mobile for performance
    const isMobile = window.innerWidth < 768
    const emberCount = isMobile ? 20 : 40
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
        95% {
          opacity: 1;
        }
        100% {
          transform: translateY(-110vh) translateX(0px) rotate(${ember.rotation}deg) scale(0.2);
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
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 1, isolation: 'isolate', transform: 'translate3d(0,0,0)', backfaceVisibility: 'hidden' }}>
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute bottom-0"
          style={{
            left: `${ember.left}%`,
            animation: `floatEmber${ember.id} ${ember.duration}s linear ${ember.delay}s infinite`,
          }}
        >
          <div
            className="rounded-full bg-samurai-red md:blur-[1px]"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              opacity: ember.opacity,
              animation: window.innerWidth < 768 
                ? `floatEmber${ember.id} ${ember.duration}s linear ${ember.delay}s infinite`
                : `emberFlickerChaotic ${1 + Math.random() * 2}s ease-in-out infinite, emberPulseGlow${ember.id} ${2 + Math.random()}s ease-in-out infinite`,
              willChange: 'transform',
              transform: 'translate3d(0,0,0)',
              backfaceVisibility: 'hidden',
              WebkitTransform: 'translate3d(0,0,0)',
              WebkitBackfaceVisibility: 'hidden',
            }}
          />
        </div>
      ))}
    </div>
  )
}
