import { useState } from 'react'
import { X, Lock, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface AuthPopupProps {
  onClose: () => void
}

export default function AuthPopup({ onClose }: AuthPopupProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://54mur-ai.github.io/RMG/#/reset-password',
        })
        if (error) throw error
        setMessage('Password reset link sent! Check your email.')
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        // Supabase automatically persists sessions in localStorage by default
        // The rememberMe option is more about UX - we keep it for user preference indication
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        onClose()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-samurai-grey-darker border-2 border-samurai-red rounded-xl shadow-2xl shadow-samurai-red/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-samurai-red transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-samurai-red" />
          </div>
          
          <h2 className="text-3xl font-black text-center text-white mb-2 neon-text">
            {isForgotPassword ? 'Reset Password' : isSignUp ? 'Join RMG' : 'Welcome Back'}
          </h2>
          <p className="text-center text-white/70 mb-6">
            {isForgotPassword ? 'Enter your email to receive a reset link' : isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-samurai-black border-2 border-samurai-steel-dark focus:border-samurai-red rounded-lg text-white placeholder-white/50 outline-none transition-colors"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {!isForgotPassword && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Password
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
                
                {!isSignUp && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 bg-samurai-black border-2 border-samurai-steel-dark rounded focus:ring-2 focus:ring-samurai-red accent-samurai-red cursor-pointer"
                    />
                    <label htmlFor="rememberMe" className="ml-2 text-sm text-white/80 cursor-pointer">
                      Remember me
                    </label>
                  </div>
                )}
              </>
            )}

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
              {loading ? 'Loading...' : isForgotPassword ? 'Send Reset Link' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isForgotPassword && (
              <button
                onClick={() => {
                  setIsForgotPassword(true)
                  setError(null)
                  setMessage(null)
                }}
                className="block w-full text-sm text-white/70 hover:text-samurai-red transition-colors"
              >
                Forgot password?
              </button>
            )}
            <button
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false)
                } else {
                  setIsSignUp(!isSignUp)
                }
                setError(null)
                setMessage(null)
              }}
              className="block w-full text-sm text-white/70 hover:text-samurai-red transition-colors"
            >
              {isForgotPassword ? 'Back to sign in' : isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
