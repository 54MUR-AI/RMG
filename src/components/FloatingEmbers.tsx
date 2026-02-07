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
        size: 2 + Math.random() * 4
      })
    }
    
    setEmbers(newEmbers)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {embers.map((ember) => (
        <div
          key={ember.id}
          className="absolute bottom-0 animate-float-up"
          style={{
            left: `${ember.left}%`,
            animationDelay: `${ember.delay}s`,
            animationDuration: `${ember.duration}s`,
          }}
        >
          <div
            className="rounded-full bg-samurai-red opacity-70 blur-sm animate-ember-flicker"
            style={{
              width: `${ember.size}px`,
              height: `${ember.size}px`,
              boxShadow: `0 0 ${ember.size * 2}px rgba(230, 57, 70, 0.8)`,
            }}
          />
        </div>
      ))}
    </div>
  )
}
