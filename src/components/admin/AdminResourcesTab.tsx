import { useState, useEffect } from 'react'
import { HardDrive, Database, Network, Key, Lock, Wallet, MessageSquare, ArrowUpDown } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface UserStats {
  userId: string
  email: string
  displayName: string
  totalFiles: number
  totalFolders: number
  storageUsed: number
  wsprMessages: number
  forumPosts: number
  apiKeys: number
  passwords: number
  wallets: number
}

type SortKey = 'storage' | 'files' | 'messages' | 'name'

export default function AdminResourcesTab() {
  const [stats, setStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortKey>('storage')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const { data: users } = await supabase.from('user_roles').select('user_id, email')
    if (!users) return

    // Fetch all display names via RPC function
    const { data: displayNames } = await supabase.rpc('get_user_display_names')
    const displayNameMap = new Map(displayNames?.map((d: any) => [d.user_id, d.display_name]) || [])

    const userStats = await Promise.all(users.map(async (u) => {
      const [files, folders, messages, posts, keys, pwds, wallets] = await Promise.all([
        supabase.from('files').select('size').eq('user_id', u.user_id),
        supabase.from('folders').select('*', { count: 'exact', head: true }).eq('user_id', u.user_id),
        supabase.from('wspr_messages').select('*', { count: 'exact', head: true }).eq('user_id', u.user_id),
        supabase.from('forum_posts').select('*', { count: 'exact', head: true }).eq('user_id', u.user_id),
        supabase.from('api_keys').select('*', { count: 'exact', head: true }).eq('user_id', u.user_id),
        supabase.from('passwords').select('*', { count: 'exact', head: true }).eq('user_id', u.user_id),
        supabase.from('crypto_wallets').select('*', { count: 'exact', head: true }).eq('user_id', u.user_id),
      ])
      
      const displayName = displayNameMap.get(u.user_id) as string | undefined
      
      return {
        userId: u.user_id,
        email: u.email || '',
        displayName: displayName || u.email?.split('@')[0] || 'Unknown',
        totalFiles: files.data?.length || 0,
        totalFolders: folders.count || 0,
        storageUsed: files.data?.reduce((sum, f) => sum + (f.size || 0), 0) || 0,
        wsprMessages: messages.count || 0,
        forumPosts: posts.count || 0,
        apiKeys: keys.count || 0,
        passwords: pwds.count || 0,
        wallets: wallets.count || 0,
      }
    }))

    setStats(userStats)
    setLoading(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const sorted = [...stats].sort((a, b) => {
    let cmp = 0
    switch (sortBy) {
      case 'storage': cmp = a.storageUsed - b.storageUsed; break
      case 'files': cmp = a.totalFiles - b.totalFiles; break
      case 'messages': cmp = a.wsprMessages - b.wsprMessages; break
      case 'name': cmp = a.displayName.localeCompare(b.displayName); break
    }
    return sortAsc ? cmp : -cmp
  })

  const handleSort = (key: SortKey) => {
    if (sortBy === key) setSortAsc(!sortAsc); else { setSortBy(key); setSortAsc(false) }
  }

  // Totals
  const totals = stats.reduce((acc, s) => ({
    files: acc.files + s.totalFiles,
    folders: acc.folders + s.totalFolders,
    storage: acc.storage + s.storageUsed,
    messages: acc.messages + s.wsprMessages,
    posts: acc.posts + s.forumPosts,
    keys: acc.keys + s.apiKeys,
    passwords: acc.passwords + s.passwords,
    wallets: acc.wallets + s.wallets,
  }), { files: 0, folders: 0, storage: 0, messages: 0, posts: 0, keys: 0, passwords: 0, wallets: 0 })

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-samurai-red border-t-transparent"></div></div>

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg sm:text-2xl font-bold text-white">Resource Usage</h3>
        <span className="text-xs sm:text-sm text-samurai-steel">{stats.length} users</span>
      </div>

      {/* Totals Summary */}
      <div className="bg-samurai-black border border-samurai-red/30 rounded-lg p-3 sm:p-4">
        <h4 className="text-xs font-bold text-samurai-red uppercase tracking-wider mb-3">Platform Totals</h4>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          <div className="text-center">
            <p className="text-white font-bold text-sm sm:text-lg">{formatBytes(totals.storage)}</p>
            <p className="text-samurai-steel text-[10px] sm:text-xs">{totals.files} files</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-sm sm:text-lg">{totals.folders}</p>
            <p className="text-samurai-steel text-[10px] sm:text-xs">folders</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-sm sm:text-lg">{totals.messages}</p>
            <p className="text-samurai-steel text-[10px] sm:text-xs">messages</p>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-sm sm:text-lg">{totals.posts}</p>
            <p className="text-samurai-steel text-[10px] sm:text-xs">forum posts</p>
          </div>
        </div>
      </div>

      {/* Sort buttons */}
      <div className="flex gap-1">
        {(['storage', 'files', 'messages', 'name'] as SortKey[]).map(key => (
          <button
            key={key}
            onClick={() => handleSort(key)}
            className={`px-2 py-1.5 rounded text-[10px] sm:text-xs font-bold uppercase flex items-center gap-1 ${
              sortBy === key ? 'bg-samurai-red/20 text-samurai-red' : 'bg-samurai-steel-dark/50 text-samurai-steel hover:text-white'
            }`}
          >
            {key}
            {sortBy === key && <ArrowUpDown size={10} />}
          </button>
        ))}
      </div>

      {/* Per-user stats */}
      {sorted.map((stat) => (
        <div key={stat.userId} className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-4">
          <h4 className="text-sm sm:text-base text-white font-bold mb-3 break-all">{stat.displayName} <span className="text-samurai-steel text-xs">({stat.email})</span></h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <HardDrive size={14} className="text-samurai-red mb-1 sm:w-4 sm:h-4" />
              <p className="text-white font-bold text-xs sm:text-sm">{formatBytes(stat.storageUsed)}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">{stat.totalFiles} files</p>
            </div>
            <div className="bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <Database size={14} className="text-samurai-red mb-1 sm:w-4 sm:h-4" />
              <p className="text-white font-bold text-xs sm:text-sm">{stat.totalFolders}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">folders</p>
            </div>
            <div className="bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <Network size={14} className="text-samurai-red mb-1 sm:w-4 sm:h-4" />
              <p className="text-white font-bold text-xs sm:text-sm">{stat.wsprMessages}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">messages</p>
            </div>
            <div className="bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <MessageSquare size={14} className="text-samurai-red mb-1 sm:w-4 sm:h-4" />
              <p className="text-white font-bold text-xs sm:text-sm">{stat.forumPosts}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">forum posts</p>
            </div>
            <div className="bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <Key size={14} className="text-samurai-red mb-1 sm:w-4 sm:h-4" />
              <p className="text-white font-bold text-xs sm:text-sm">{stat.apiKeys}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">API keys</p>
            </div>
            <div className="bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <Lock size={14} className="text-samurai-red mb-1 sm:w-4 sm:h-4" />
              <p className="text-white font-bold text-xs sm:text-sm">{stat.passwords}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">passwords</p>
            </div>
            <div className="bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <Wallet size={14} className="text-samurai-red mb-1 sm:w-4 sm:h-4" />
              <p className="text-white font-bold text-xs sm:text-sm">{stat.wallets}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">wallets</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
