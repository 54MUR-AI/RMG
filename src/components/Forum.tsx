import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'
import { MessageSquare, Plus, TrendingUp, Clock, Pin, Lock, ArrowUp, ArrowDown, Eye, Trash2 } from 'lucide-react'
import { getCategories, getThreads, voteThread, type ForumThread, type ForumCategory } from '../lib/forum'
import { toggleThreadPin, toggleThreadLock, deleteThread } from '../lib/admin'
import CreateThreadModal from './CreateThreadModal'
import ThreadViewModal from './ThreadViewModal'
import UserIdBadge from './UserIdBadge'

export default function Forum() {
  const { user } = useAuth()
  const { isAdmin } = useAdmin()
  const [threads, setThreads] = useState<ForumThread[]>([])
  const [categories, setCategories] = useState<ForumCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedThread, setSelectedThread] = useState<ForumThread | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadThreads()
  }, [selectedCategory, user])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
      // Set Announcements (first category after reordering) as default
      if (data.length > 0 && selectedCategory === undefined) {
        const announcementsCategory = data.find(cat => cat.name === 'Announcements')
        if (announcementsCategory) {
          setSelectedCategory(announcementsCategory.id)
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadThreads = async () => {
    try {
      setLoading(true)
      const data = await getThreads(selectedCategory, user?.id)
      setThreads(data)
    } catch (error) {
      console.error('Error loading threads:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (threadId: string, voteType: number) => {
    if (!user) return
    
    try {
      await voteThread(threadId, user.id, voteType)
      await loadThreads()
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handlePinThread = async (e: React.MouseEvent, threadId: string, isPinned: boolean) => {
    e.stopPropagation()
    if (!isAdmin) return
    
    try {
      await toggleThreadPin(threadId, !isPinned)
      await loadThreads()
    } catch (error) {
      console.error('Error pinning thread:', error)
    }
  }

  const handleLockThread = async (e: React.MouseEvent, threadId: string, isLocked: boolean) => {
    e.stopPropagation()
    if (!isAdmin) return
    
    try {
      await toggleThreadLock(threadId, !isLocked)
      await loadThreads()
    } catch (error) {
      console.error('Error locking thread:', error)
    }
  }

  const handleDeleteThread = async (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation()
    if (!isAdmin) return
    
    if (!confirm('Are you sure you want to delete this thread? This cannot be undone.')) return
    
    try {
      await deleteThread(threadId)
      await loadThreads()
    } catch (error) {
      console.error('Error deleting thread:', error)
    }
  }

  const sortedThreads = [...threads].sort((a, b) => {
    if (sortBy === 'popular') {
      return (b.vote_count || 0) - (a.vote_count || 0)
    }
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="w-full max-w-7xl mx-auto mb-12">
      {/* Forum Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-samurai-red" />
          <h2 className="text-3xl font-black text-white">FORUM</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-samurai-red transition-colors font-semibold border border-white/20 hover:border-samurai-red rounded touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          <span>New Thread</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-6 mb-6 pb-4 border-b border-white/10">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`font-semibold transition-all touch-manipulation relative ${
            !selectedCategory
              ? 'text-samurai-red after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-samurai-red'
              : 'text-white/70 hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`font-semibold transition-all touch-manipulation relative ${
              selectedCategory === category.id
                ? 'text-samurai-red after:absolute after:bottom-[-17px] after:left-0 after:right-0 after:h-0.5 after:bg-samurai-red'
                : 'text-white/70 hover:text-white'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex gap-6 mb-6">
        <button
          onClick={() => setSortBy('recent')}
          className={`flex items-center gap-2 font-semibold transition-all touch-manipulation relative ${
            sortBy === 'recent'
              ? 'text-samurai-red'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className={sortBy === 'recent' ? 'underline decoration-2 underline-offset-4' : ''}>Recent</span>
        </button>
        <button
          onClick={() => setSortBy('popular')}
          className={`flex items-center gap-2 font-semibold transition-all touch-manipulation relative ${
            sortBy === 'popular'
              ? 'text-samurai-red'
              : 'text-white/70 hover:text-white'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span className={sortBy === 'popular' ? 'underline decoration-2 underline-offset-4' : ''}>Popular</span>
        </button>
      </div>

      {/* Thread List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
        </div>
      ) : sortedThreads.length === 0 ? (
        <div className="text-center py-12 bg-samurai-grey-darker rounded-lg border-2 border-samurai-grey">
          <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/70 text-lg">No threads yet. Be the first to start a discussion!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedThreads.map((thread) => (
            <div
              key={thread.id}
              className="bg-samurai-black border border-samurai-steel-dark/50 hover:border-samurai-red rounded-lg p-5 md:p-6 transition-all cursor-pointer group shadow-sm hover:shadow-md"
              onClick={() => setSelectedThread(thread)}
            >
              <div className="flex flex-col md:flex-row gap-4">
                {/* Vote Section */}
                <div className="flex md:flex-col items-center gap-2 md:gap-1 md:min-w-[60px] order-2 md:order-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVote(thread.id, 1)
                    }}
                    disabled={!user}
                    className={`p-2 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${
                      thread.user_vote === 1
                        ? 'text-samurai-red bg-samurai-red/10'
                        : 'text-white/50 hover:text-samurai-red hover:bg-samurai-red/5'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <span className={`font-bold text-lg px-2 ${
                    (thread.vote_count || 0) > 0 ? 'text-samurai-red' : 
                    (thread.vote_count || 0) < 0 ? 'text-blue-400' : 'text-white/70'
                  }`}>
                    {thread.vote_count || 0}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVote(thread.id, -1)
                    }}
                    disabled={!user}
                    className={`p-2 rounded transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation ${
                      thread.user_vote === -1
                        ? 'text-blue-400 bg-blue-400/10'
                        : 'text-white/50 hover:text-blue-400 hover:bg-blue-400/5'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Thread Content */}
                <div className="flex-1 min-w-0 order-1 md:order-2">
                  <div className="flex items-start gap-2 mb-3">
                    {thread.is_pinned && <Pin className="w-5 h-5 text-samurai-red flex-shrink-0 mt-0.5" />}
                    {thread.is_locked && <Lock className="w-5 h-5 text-white/50 flex-shrink-0 mt-0.5" />}
                    <h3 className="text-xl md:text-lg font-bold text-white group-hover:text-samurai-red transition-colors leading-tight">
                      {thread.title}
                    </h3>
                  </div>
                  
                  <p className="text-white/60 text-sm mb-4 line-clamp-1 hidden md:block">
                    {thread.content}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-sm text-white/50">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: thread.author_avatar_color }}
                        >
                          {thread.author_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{thread.author_name}</span>
                        {isAdmin && thread.author_id && (
                          <UserIdBadge userId={thread.author_id} />
                        )}
                      </div>
                      {thread.category && (
                        <span className="px-2.5 py-1 bg-samurai-grey rounded text-xs font-medium whitespace-nowrap">
                          {thread.category.icon} {thread.category.name}
                        </span>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <MessageSquare className="w-4 h-4" />
                          <span>{thread.reply_count}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span>{thread.view_count}</span>
                        </div>
                        <span className="hidden sm:inline">{formatTimeAgo(thread.updated_at)}</span>
                      </div>
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => handlePinThread(e, thread.id, thread.is_pinned)}
                          className={`p-2 rounded transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation ${
                            thread.is_pinned 
                              ? 'bg-samurai-red text-white hover:bg-samurai-red-dark' 
                              : 'bg-samurai-grey hover:bg-samurai-grey-dark text-white/70'
                          }`}
                          title={thread.is_pinned ? 'Unpin thread' : 'Pin thread'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleLockThread(e, thread.id, thread.is_locked)}
                          className={`p-2 rounded transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation ${
                            thread.is_locked 
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700' 
                              : 'bg-samurai-grey hover:bg-samurai-grey-dark text-white/70'
                          }`}
                          title={thread.is_locked ? 'Unlock thread' : 'Lock thread'}
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteThread(e, thread.id)}
                          className="p-2 rounded bg-samurai-grey hover:bg-red-600 text-white/70 hover:text-white transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center touch-manipulation"
                          title="Delete thread"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateThreadModal
          categories={categories}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false)
            loadThreads()
          }}
        />
      )}

      {selectedThread && (
        <ThreadViewModal
          thread={selectedThread}
          onClose={() => setSelectedThread(null)}
          onUpdate={loadThreads}
        />
      )}
    </div>
  )
}
