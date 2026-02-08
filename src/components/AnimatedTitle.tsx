import { useEffect } from 'react'

export default function AnimatedTitle() {
  useEffect(() => {
    const titles = [
      '🔥 Ronin Media',
      '🔥 Ronin Media 🔥',
      '🌟 Ronin Media 🔥',
      '✨ Ronin Media 🔥',
      '🔥 Ronin Media ✨',
      'Ronin Media 🔥',
      '🔥 Ronin Media',
      'Ronin Media',
    ]
    
    let currentIndex = 0
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % titles.length
      document.title = titles[currentIndex]
    }, 800) // Change every 800ms for a flickering effect
    
    return () => {
      clearInterval(interval)
      document.title = 'Ronin Media' // Reset to default on unmount
    }
  }, [])
  
  return null // This component doesn't render anything
}
