import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useAdmin } from '../contexts/AdminContext'
import { MessageSquare, Plus, TrendingUp, Clock, Pin, Lock, ArrowUp, ArrowDown, Eye, Trash2 } from 'lucide-react'
import { getCategories, getThreads, voteThread, type ForumThread, type ForumCategory } from '../lib/forum'
import { toggleThreadPin, toggleThreadLock, deleteThread } from '../lib/admin'
import CreateThreadModal from './CreateThreadModal'
import ThreadViewModal from './ThreadViewModal'

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
    loadThreads()
  }, [selectedCategory, user])

  const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-samurai-red" />
          <h2 className="text-3xl font-black text-white">FORUM</h2>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-samurai-red text-white rounded-lg font-bold hover:bg-samurai-red-dark transition-all shadow-lg hover:shadow-samurai-red/50"
        >
          <Plus className="w-5 h-5" />
          New Thread
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(undefined)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            !selectedCategory
              ? 'bg-samurai-red text-white'
              : 'bg-samurai-grey-dark text-white/70 hover:bg-samurai-grey'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedCategory === category.id
                ? 'bg-samurai-red text-white'
                : 'bg-samurai-grey-dark text-white/70 hover:bg-samurai-grey'
            }`}
          >
            {category.icon} {category.name}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSortBy('recent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            sortBy === 'recent'
              ? 'bg-samurai-red text-white'
              : 'bg-samurai-grey-dark text-white/70 hover:bg-samurai-grey'
          }`}
        >
          <Clock className="w-4 h-4" />
          Recent
        </button>
        <button
          onClick={() => setSortBy('popular')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
            sortBy === 'popular'
              ? 'bg-samurai-red text-white'
              : 'bg-samurai-grey-dark text-white/70 hover:bg-samurai-grey'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Popular
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
        <div className="space-y-3">
          {sortedThreads.map((thread) => (
            <div
              key={thread.id}
              className="bg-samurai-grey-darker border-2 border-samurai-steel-dark hover:border-samurai-red rounded-lg p-4 transition-all cursor-pointer group"
              onClick={() => setSelectedThread(thread)}
            >
              <div className="flex gap-4">
                {/* Vote Section */}
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVote(thread.id, 1)
                    }}
                    disabled={!user}
                    className={`p-1 rounded transition-colors ${
                      thread.user_vote === 1
                        ? 'text-samurai-red'
                        : 'text-white/50 hover:text-samurai-red'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowUp className="w-5 h-5" />
                  </button>
                  <span className={`font-bold ${
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
                    className={`p-1 rounded transition-colors ${
                      thread.user_vote === -1
                        ? 'text-blue-400'
                        : 'text-white/50 hover:text-blue-400'
                    } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <ArrowDown className="w-5 h-5" />
                  </button>
                </div>

                {/* Thread Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 mb-2">
                    {thread.is_pinned && <Pin className="w-4 h-4 text-samurai-red flex-shrink-0 mt-1" />}
                    {thread.is_locked && <Lock className="w-4 h-4 text-white/50 flex-shrink-0 mt-1" />}
                    <h3 className="text-lg font-bold text-white group-hover:text-samurai-red transition-colors">
                      {thread.title}
                    </h3>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-3 line-clamp-2">
                    {thread.content}
                  </p>

                  <div className="flex items-center justify-between gap-4 text-sm text-white/50">
                    <div className="flex items-center gap-4">
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
                      <span>{formatTimeAgo(thread.updated_at)}</span>
                    </div>

                    {/* Admin Controls */}
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handlePinThread(e, thread.id, thread.is_pinned)}
                          className={`p-1.5 rounded transition-colors ${
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
                          className={`p-1.5 rounded transition-colors ${
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
                          className="p-1.5 rounded bg-samurai-grey hover:bg-red-600 text-white/70 hover:text-white transition-colors"
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
