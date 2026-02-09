import { Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Forum from '../components/Forum'

export default function ForgePage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="bg-samurai-black flex items-center justify-center p-4 py-32">
        <div className="text-center">
          <Lock className="w-16 h-16 text-samurai-red mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2 neon-text">FORGE</h2>
          <p className="text-white/70 mb-6">Please sign in to access the forum</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-samurai-black py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Forum />
      </div>
    </div>
  )
}
