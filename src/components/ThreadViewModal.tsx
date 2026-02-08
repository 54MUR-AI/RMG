import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { X, Send, ArrowUp, ArrowDown, MessageSquare, Eye, Trash2 } from 'lucide-react'
import { getThreadPosts, createPost, voteThread, votePost, deletePost, type ForumThread, type ForumPost } from '../lib/forum'

interface ThreadViewModalProps {
  thread: ForumThread
  onClose: () => void
  onUpdate: () => void
}

export default function ThreadViewModal({ thread, onClose, onUpdate }: ThreadViewModalProps) {
  const { user } = useAuth()
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [replyContent, setReplyContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPosts()
  }, [thread.id])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await getThreadPosts(thread.id, user?.id)
      setPosts(data)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleThreadVote = async (voteType: number) => {
    if (!user) return
    
    try {
      await voteThread(thread.id, user.id, voteType)
      onUpdate()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handlePostVote = async (postId: string, voteType: number) => {
    if (!user) return
    
    try {
      await votePost(postId, user.id, voteType)
      await loadPosts()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!replyContent.trim()) return

    try {
      setSubmitting(true)
      
      const authorName = isAnonymous 
        ? 'Anonymous' 
        : user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Anonymous'
      
      const authorColor = isAnonymous 
        ? '#6B7280' 
        : user?.user_metadata?.avatar_color || '#E63946'

      await createPost({
        thread_id: thread.id,
        content: replyContent.trim(),
        is_anonymous: isAnonymous,
        author_name: authorName,
        author_avatar_color: authorColor,
        author_id: user?.id
      })

      setReplyContent('')
      setIsAnonymous(false)
      await loadPosts()
      onUpdate()
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to post reply. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!user || !confirm('Delete this reply?')) return

    try {
      await deletePost(postId, user.id)
      await loadPosts()
      onUpdate()
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Failed to delete post.')
    }
  }

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-samurai-grey-darker border-b-2 border-samurai-grey p-6 flex items-start justify-between z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white mb-2">{thread.title}</h2>
            <div className="flex items-center gap-4 text-sm text-white/50">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: thread.author_avatar_color }}
                >
                  {thread.author_name.charAt(0).toUpperCase()}
                </div>
                <span>{thread.author_name}</span>
              </div>
              {thread.category && (
                <span className="px-2 py-1 bg-samurai-grey rounded text-xs">
                  {thread.category.icon} {thread.category.name}
                </span>
              )}
              <div className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                <span>{thread.reply_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <span>{thread.view_count}</span>
              </div>
              <span>{formatTimeAgo(thread.created_at)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-samurai-red transition-colors ml-4"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Thread Content */}
        <div className="p-6 border-b-2 border-samurai-grey">
          <div className="flex gap-4">
            {/* Vote Section */}
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <button
                onClick={() => handleThreadVote(1)}
                disabled={!user}
                className={`p-1 rounded transition-colors ${
                  thread.user_vote === 1
                    ? 'text-samurai-red'
                    : 'text-white/50 hover:text-samurai-red'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ArrowUp className="w-6 h-6" />
              </button>
              <span className={`font-bold text-lg ${
                (thread.vote_count || 0) > 0 ? 'text-samurai-red' : 
                (thread.vote_count || 0) < 0 ? 'text-blue-400' : 'text-white/70'
              }`}>
                {thread.vote_count || 0}
              </span>
              <button
                onClick={() => handleThreadVote(-1)}
                disabled={!user}
                className={`p-1 rounded transition-colors ${
                  thread.user_vote === -1
                    ? 'text-blue-400'
                    : 'text-white/50 hover:text-blue-400'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ArrowDown className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <p className="text-white whitespace-pre-wrap">{thread.content}</p>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">
            {posts.length} {posts.length === 1 ? 'Reply' : 'Replies'}
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              No replies yet. Be the first to comment!
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="flex gap-4 p-4 bg-samurai-grey rounded-lg">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-1 min-w-[50px]">
                  <button
                    onClick={() => handlePostVote(post.id, 1)}
                    disabled={!user}
                    className={`p-1 rounded transition-colors ${
                      post.user_vote === 1
                        ? 'text-samurai-red'
                        : 'text-white/50 hover:text-samurai-red'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <span className={`font-bold ${
                    (post.vote_count || 0) > 0 ? 'text-samurai-red' : 
                    (post.vote_count || 0) < 0 ? 'text-blue-400' : 'text-white/70'
                  }`}>
                    {post.vote_count || 0}
                  </span>
                  <button
                    onClick={() => handlePostVote(post.id, -1)}
                    disabled={!user}
                    className={`p-1 rounded transition-colors ${
                      post.user_vote === -1
                        ? 'text-blue-400'
                        : 'text-white/50 hover:text-blue-400'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: post.author_avatar_color }}
                      >
                        {post.author_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white font-semibold">{post.author_name}</span>
                      <span className="text-white/50 text-sm">{formatTimeAgo(post.created_at)}</span>
                    </div>
                    {user && post.author_id === user.id && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="text-white/50 hover:text-samurai-red transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-white/90 whitespace-pre-wrap">{post.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Reply Form */}
        {!thread.is_locked && (
          <div className="sticky bottom-0 bg-samurai-grey-darker border-t-2 border-samurai-grey p-6">
            <form onSubmit={handleReply} className="space-y-4">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                rows={4}
                className="w-full px-4 py-3 bg-samurai-grey border-2 border-samurai-grey-dark rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none transition-colors resize-none"
                maxLength={2000}
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="reply-anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded border-2 border-samurai-grey-dark bg-samurai-grey text-samurai-red focus:ring-samurai-red focus:ring-2"
                  />
                  <label htmlFor="reply-anonymous" className="text-white/70 text-sm cursor-pointer">
                    Post anonymously
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !replyContent.trim()}
                  className="flex items-center gap-2 px-6 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-samurai-red/50"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Reply
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
