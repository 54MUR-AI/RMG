import { useEffect } from 'react'
import DiscordIcon from '../components/DiscordIcon'

export default function DiscordPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
    // Redirect to Discord invite after a brief moment
    const timer = setTimeout(() => {
      window.location.href = 'https://discord.gg/EHcZ5PZ877'
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="bg-samurai-black flex items-center justify-center py-32">
      <div className="text-center">
        <DiscordIcon size={80} className="text-samurai-red mx-auto mb-6 animate-pulse" />
        <h1 className="text-4xl font-black text-white mb-4">Entering the Dojo...</h1>
        <p className="text-xl text-samurai-steel-light">Redirecting to Discord</p>
      </div>
    </div>
  )
}
