import { useState, useEffect } from 'react'
import { Cpu, Trash2, Download, Send, Info, Clock, Users, MessageSquare, FileText, Database } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface PlatformStats {
  totalUsers: number
  totalFiles: number
  totalMessages: number
  totalForumThreads: number
  totalForumPosts: number
}

export default function AdminSystemTab() {
  const [stats, setStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [announcement, setAnnouncement] = useState('')
  const [announcementSending, setAnnouncementSending] = useState(false)
  const [lastAction, setLastAction] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const [users, files, messages, threads, posts] = await Promise.all([
      supabase.from('user_roles').select('*', { count: 'exact', head: true }),
      supabase.from('files').select('*', { count: 'exact', head: true }),
      supabase.from('wspr_messages').select('*', { count: 'exact', head: true }),
      supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
      supabase.from('forum_posts').select('*', { count: 'exact', head: true }),
    ])
    setStats({
      totalUsers: users.count || 0,
      totalFiles: files.count || 0,
      totalMessages: messages.count || 0,
      totalForumThreads: threads.count || 0,
      totalForumPosts: posts.count || 0,
    })
    setLoading(false)
  }

  const handleClearCache = () => {
    const keys = Object.keys(localStorage)
    const cacheKeys = keys.filter(k => k.includes('cache') || k.includes('Cache') || k.includes('tmp'))
    cacheKeys.forEach(k => localStorage.removeItem(k))
    setLastAction(`Cleared ${cacheKeys.length} cached items from localStorage`)
  }

  const handleExportLogs = async () => {
    // Export recent forum activity + user signups as a JSON log
    const [{ data: recentThreads }, { data: recentPosts }, { data: recentUsers }] = await Promise.all([
      supabase.from('forum_threads').select('id, title, user_id, created_at').order('created_at', { ascending: false }).limit(50),
      supabase.from('forum_posts').select('id, user_id, created_at').order('created_at', { ascending: false }).limit(100),
      supabase.from('user_roles').select('user_id, email, created_at').order('created_at', { ascending: false }).limit(50),
    ])
    const logData = {
      exportedAt: new Date().toISOString(),
      recentThreads: recentThreads || [],
      recentPosts: recentPosts || [],
      recentUsers: recentUsers || [],
    }
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rmg-logs-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setLastAction('Exported activity logs')
  }

  const handleBroadcast = async () => {
    if (!announcement.trim()) return
    setAnnouncementSending(true)
    // Post announcement as a system message in the General channel
    const { data: generalChannel } = await supabase
      .from('wspr_channels')
      .select('id')
      .eq('name', 'General')
      .maybeSingle()

    if (generalChannel) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('wspr_messages').insert({
          channel_id: generalChannel.id,
          user_id: user.id,
          content: `**[SYSTEM ANNOUNCEMENT]** ${announcement.trim()}`,
        })
      }
    }
    setLastAction(`Broadcast sent: "${announcement.trim().slice(0, 50)}..."`)
    setAnnouncement('')
    setAnnouncementSending(false)
  }

  const buildDate = document.querySelector('meta[name="build-date"]')?.getAttribute('content') || 'N/A'

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">System Information</h3>

      {/* Platform Stats */}
      {loading ? (
        <div className="flex justify-center p-6"><div className="animate-spin rounded-full h-8 w-8 border-4 border-samurai-red border-t-transparent"></div></div>
      ) : stats && (
        <div className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-4">
          <h4 className="text-xs font-bold text-samurai-red uppercase tracking-wider mb-3 flex items-center gap-2">
            <Database size={14} /> Platform Overview
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
            <div className="text-center bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <Users size={16} className="text-samurai-red mx-auto mb-1" />
              <p className="text-white font-bold text-sm sm:text-lg">{stats.totalUsers}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">users</p>
            </div>
            <div className="text-center bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <FileText size={16} className="text-samurai-red mx-auto mb-1" />
              <p className="text-white font-bold text-sm sm:text-lg">{stats.totalFiles}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">files</p>
            </div>
            <div className="text-center bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <MessageSquare size={16} className="text-samurai-red mx-auto mb-1" />
              <p className="text-white font-bold text-sm sm:text-lg">{stats.totalMessages}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">messages</p>
            </div>
            <div className="text-center bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <MessageSquare size={16} className="text-samurai-red mx-auto mb-1" />
              <p className="text-white font-bold text-sm sm:text-lg">{stats.totalForumThreads}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">threads</p>
            </div>
            <div className="text-center bg-samurai-grey-darker p-2 sm:p-3 rounded">
              <MessageSquare size={16} className="text-samurai-red mx-auto mb-1" />
              <p className="text-white font-bold text-sm sm:text-lg">{stats.totalForumPosts}</p>
              <p className="text-samurai-steel text-[10px] sm:text-xs">forum posts</p>
            </div>
          </div>
        </div>
      )}

      {/* Environment Info */}
      <div className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-4">
        <h4 className="text-xs font-bold text-samurai-red uppercase tracking-wider mb-3 flex items-center gap-2">
          <Info size={14} /> Environment
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
          <div className="flex justify-between bg-samurai-grey-darker p-2 rounded">
            <span className="text-samurai-steel">Platform</span>
            <span className="text-white font-bold">RMG Studio</span>
          </div>
          <div className="flex justify-between bg-samurai-grey-darker p-2 rounded">
            <span className="text-samurai-steel">Host</span>
            <span className="text-white font-bold">Netlify</span>
          </div>
          <div className="flex justify-between bg-samurai-grey-darker p-2 rounded">
            <span className="text-samurai-steel">Database</span>
            <span className="text-white font-bold">Supabase</span>
          </div>
          <div className="flex justify-between bg-samurai-grey-darker p-2 rounded">
            <span className="text-samurai-steel">Build</span>
            <span className="text-white font-bold font-mono">{buildDate}</span>
          </div>
          <div className="flex justify-between bg-samurai-grey-darker p-2 rounded">
            <span className="text-samurai-steel">URL</span>
            <span className="text-white font-bold truncate ml-2">roninmedia.studio</span>
          </div>
          <div className="flex justify-between bg-samurai-grey-darker p-2 rounded">
            <span className="text-samurai-steel">Session</span>
            <span className="text-white font-bold font-mono">{new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-6">
        <h4 className="text-xs font-bold text-samurai-red uppercase tracking-wider mb-3 flex items-center gap-2">
          <Cpu size={14} /> Quick Actions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <button onClick={handleClearCache} className="py-2.5 sm:py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg text-sm sm:text-base flex items-center justify-center gap-2">
            <Trash2 size={16} /> Clear Cache
          </button>
          <button onClick={handleExportLogs} className="py-2.5 sm:py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg text-sm sm:text-base flex items-center justify-center gap-2">
            <Download size={16} /> Export Logs
          </button>
        </div>
      </div>

      {/* Broadcast Announcement */}
      <div className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-6">
        <h4 className="text-xs font-bold text-samurai-red uppercase tracking-wider mb-3 flex items-center gap-2">
          <Send size={14} /> Broadcast Announcement
        </h4>
        <p className="text-samurai-steel text-xs mb-3">Send a system announcement to the WSPR General channel.</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={announcement}
            onChange={e => setAnnouncement(e.target.value)}
            placeholder="Type your announcement..."
            className="flex-1 px-3 py-2 bg-samurai-grey-darker border border-samurai-steel-dark rounded-lg text-white text-sm focus:outline-none focus:border-samurai-red placeholder:text-samurai-steel/50"
            onKeyDown={e => e.key === 'Enter' && handleBroadcast()}
          />
          <button
            onClick={handleBroadcast}
            disabled={!announcement.trim() || announcementSending}
            className="px-4 py-2 bg-samurai-red hover:bg-samurai-red-dark text-white font-bold rounded-lg text-sm disabled:opacity-50 flex items-center gap-2"
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>

      {/* Last action feedback */}
      {lastAction && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-900/10 border border-green-900/30 rounded-lg p-3">
          <Clock size={14} />
          {lastAction}
        </div>
      )}
    </div>
  )
}
