import { useEffect, useState } from 'react'

interface Ember {
  id: number
  left: number
  delay: number
  duration: number
  size: number
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
        duration: 8 + Math.random() * 7,
        size: 4 + Math.random() * 6
      })
    }
    
    setEmbers(newEmbers)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute bottom-0 animate-float-up"
          style={{
            left: `${ember.left}%`,
            animationDelay: `${ember.delay}s`,
            animationDuration: `${ember.duration}s`,
            zIndex: 0,
          }}
        >
          <div
            className="rounded-full bg-samurai-red blur-[1px] animate-ember-flicker"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              opacity: 0.9,
              boxShadow: `0 0 ${ember.size * 3}px rgba(230, 57, 70, 1), 0 0 ${ember.size * 6}px rgba(230, 57, 70, 0.6)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
