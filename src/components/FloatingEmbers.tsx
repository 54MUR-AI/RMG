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
        opacity: 0.6 + Math.random() * 0.3 // Varying opacity
      })
    }
    
    setEmbers(newEmbers)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute bottom-0"
          style={{
            left: `${ember.left}%`,
            animation: `floatChaotic ${ember.duration}s ease-in-out ${ember.delay}s infinite`,
            '--drift': `${ember.drift}px`,
            '--rotation': `${ember.rotation}deg`,
            zIndex: 0,
          } as React.CSSProperties}
        >
          <div
            className="rounded-full bg-samurai-red blur-[1px]"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              opacity: ember.opacity,
              boxShadow: `0 0 ${ember.size * 3}px rgba(230, 57, 70, 1), 0 0 ${ember.size * 6}px rgba(230, 57, 70, 0.6)`,
              animation: `emberFlickerChaotic ${1 + Math.random() * 2}s ease-in-out infinite`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
