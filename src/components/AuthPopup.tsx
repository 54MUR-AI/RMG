import { useState } from 'react'
import { X, Lock, Mail, Github } from 'lucide-react'
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

  const handleOAuthSignIn = async (provider: 'github' | 'google') => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin + window.location.pathname,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

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

          {!isForgotPassword && (
            <>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('github')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#24292e] hover:bg-[#1a1e22] text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Github size={20} />
                  Continue with GitHub
                </button>
                
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-200"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-samurai-steel-dark"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-samurai-grey-darker text-white/60">Or continue with email</span>
                </div>
              </div>
            </>
          )}

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
