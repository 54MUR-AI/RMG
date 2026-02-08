import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { createThread, type ForumCategory } from '../lib/forum'
import ModalPortal from './ModalPortal'

interface CreateThreadModalProps {
  categories: ForumCategory[]
  onClose: () => void
  onSuccess: () => void
}

export default function CreateThreadModal({ categories, onClose, onSuccess }: CreateThreadModalProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all fields')
      return
    }

    try {
      setSubmitting(true)
      
      const authorName = isAnonymous 
        ? 'Anonymous' 
        : user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Anonymous'
      
      const authorColor = isAnonymous 
        ? '#6B7280' 
        : user?.user_metadata?.avatar_color || '#E63946'

      await createThread({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId || undefined,
        is_anonymous: isAnonymous,
        author_name: authorName,
        author_avatar_color: authorColor,
        author_id: user?.id
      })

      onSuccess()
    } catch (error) {
      console.error('Error creating thread:', error)
      alert('Failed to create thread. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-samurai-grey">
          <h2 className="text-2xl font-black text-white">Create New Thread</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-samurai-red transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full px-4 py-3 bg-samurai-grey-darker border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none transition-colors"
              maxLength={200}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Category
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 bg-samurai-grey-darker border-2 border-samurai-grey rounded-lg text-white focus:border-samurai-red focus:outline-none transition-colors"
            >
              <option value="">General</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-white font-semibold mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={8}
              className="w-full px-4 py-3 bg-samurai-grey-darker border-2 border-samurai-grey rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none transition-colors resize-none"
              maxLength={5000}
            />
            <div className="text-right text-sm text-white/50 mt-1">
              {content.length} / 5000
            </div>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-3 p-4 bg-samurai-grey rounded-lg">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-samurai-grey-dark bg-samurai-grey-darker text-samurai-red focus:ring-samurai-red focus:ring-2"
            />
            <label htmlFor="anonymous" className="text-white cursor-pointer">
              Post anonymously
              <span className="block text-sm text-white/50">
                Your identity will be hidden from other users
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-samurai-grey border-2 border-samurai-grey-dark text-white rounded-lg font-bold hover:bg-samurai-grey-dark transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-samurai-red/50"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Post Thread
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </ModalPortal>
  )
}
