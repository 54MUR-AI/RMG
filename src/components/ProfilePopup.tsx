import { useState } from 'react'
import { X, User, Shield, Palette, Upload } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import ModalPortal from './ModalPortal'

interface ProfilePopupProps {
  onClose: () => void
}

export default function ProfilePopup({ onClose }: ProfilePopupProps) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '')
  const [bio, setBio] = useState(user?.user_metadata?.bio || '')
  const [avatarColor, setAvatarColor] = useState(user?.user_metadata?.avatar_color || '#E63946')
  const [avatarUrl, setAvatarUrl] = useState(user?.user_metadata?.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const colors = [
    '#E63946', // samurai-red
    '#F77F00', // orange
    '#06FFA5', // neon green
    '#4CC9F0', // cyan
    '#7209B7', // purple
    '#F72585', // pink
  ]

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setAvatarUrl(publicUrl)
      setMessage('Avatar uploaded! Remember to save your profile.')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      // Check if display name changed
      const oldDisplayName = user?.user_metadata?.display_name
      const displayNameChanged = displayName !== oldDisplayName

      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          bio: bio,
          avatar_color: avatarColor,
          avatar_url: avatarUrl,
        }
      })

      if (error) throw error

      // Track display name change in history
      if (displayNameChanged && displayName && user?.id) {
        await supabase
          .from('display_name_history')
          .insert({
            user_id: user.id,
            display_name: displayName,
            changed_at: new Date().toISOString()
          })
      }

      setMessage('Profile updated successfully!')
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-xl shadow-2xl shadow-samurai-red/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-samurai-grey-darker border-b-2 border-samurai-red p-6 flex items-center justify-between">
          <h2 className="text-3xl font-black text-white neon-text">Your Profile</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-samurai-red transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover shadow-lg"
              />
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg"
                style={{ backgroundColor: avatarColor }}
              >
                {displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* Anonymity Notice */}
          <div className="bg-samurai-red/10 border border-samurai-red/50 rounded-lg p-4 flex items-start gap-3">
            <Shield className="text-samurai-red flex-shrink-0 mt-1" size={20} />
            <div>
              <p className="text-white font-bold mb-1">Privacy First</p>
              <p className="text-white/70 text-sm">
                Your profile is designed for anonymity. Display names are optional and visible only within RMG. Your email is never shown publicly.
              </p>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
              <User size={16} />
              Display Name (Optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-steel-dark focus:border-samurai-red rounded-lg text-white placeholder-white/50 outline-none transition-colors"
              placeholder="Choose a display name..."
              maxLength={30}
            />
            <p className="text-white/50 text-xs mt-1">Leave blank to use your email prefix</p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Bio (Optional)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 bg-samurai-black border-2 border-samurai-steel-dark focus:border-samurai-red rounded-lg text-white placeholder-white/50 outline-none transition-colors resize-none"
              placeholder="Tell us about yourself..."
              rows={3}
              maxLength={200}
            />
            <p className="text-white/50 text-xs mt-1">{bio.length}/200 characters</p>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
              <Upload size={16} />
              Profile Picture (Optional)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
                disabled={uploading}
              />
              <label
                htmlFor="avatar-upload"
                className={`px-4 py-2 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg transition-all cursor-pointer ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {uploading ? 'Uploading...' : avatarUrl ? 'Change Picture' : 'Upload Picture'}
              </label>
              {avatarUrl && (
                <button
                  onClick={() => setAvatarUrl('')}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold rounded-lg transition-all"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-white/50 text-xs mt-2">Max 2MB. Leave empty to use color badge.</p>
          </div>

          {/* Avatar Color */}
          {!avatarUrl && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-3 flex items-center gap-2">
                <Palette size={16} />
                Avatar Color
              </label>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setAvatarColor(color)}
                    className={`w-12 h-12 rounded-full transition-all ${
                      avatarColor === color
                        ? 'ring-4 ring-white scale-110'
                        : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
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

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 bg-samurai-red hover:bg-samurai-red-dark text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-samurai-red/50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    </ModalPortal>
  )
}
