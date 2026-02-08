import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we have a valid session from the reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.')
      }
    })
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setMessage('Password updated successfully! Redirecting...')
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-samurai-black flex items-center justify-center p-4 py-32">
      <div className="w-full max-w-md bg-samurai-grey-darker border-2 border-samurai-red rounded-xl shadow-2xl shadow-samurai-red/20 p-8">
        <div className="flex items-center justify-center mb-6">
          <Lock className="w-12 h-12 text-samurai-red" />
        </div>
        
        <h1 className="text-3xl font-black text-center text-white mb-2 neon-text">
          Reset Password
        </h1>
        <p className="text-center text-white/70 mb-6">
          Enter your new password below
        </p>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-samurai-black border-2 border-samurai-steel-dark focus:border-samurai-red rounded-lg text-white placeholder-white/50 outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-samurai-black border-2 border-samurai-steel-dark focus:border-samurai-red rounded-lg text-white placeholder-white/50 outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-samurai-red hover:bg-samurai-red-dark text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-samurai-red/50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-white/70 hover:text-samurai-red transition-colors"
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
