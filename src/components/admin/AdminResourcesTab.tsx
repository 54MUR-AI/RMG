import { useState, useEffect } from 'react'
import { HardDrive, Database, Network } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface UserStats {
  userId: string
  email: string
  displayName: string
  isOnline: boolean
  totalFiles: number
  totalFolders: number
  storageUsed: number
  wsprMessages: number
}

export default function AdminResourcesTab() {
  const [stats, setStats] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const { data: profiles } = await supabase.from('profiles').select('id, email, display_name')
    if (!profiles) return

    const userStats = await Promise.all(profiles.map(async (p) => {
      const { data: files } = await supabase.from('files').select('size').eq('user_id', p.id)
      const { count: folders } = await supabase.from('folders').select('*', { count: 'exact', head: true }).eq('user_id', p.id)
      const { count: messages } = await supabase.from('wspr_messages').select('*', { count: 'exact', head: true }).eq('user_id', p.id)
      
      return {
        userId: p.id,
        email: p.email || '',
        displayName: p.display_name || 'Unknown',
        isOnline: false,
        totalFiles: files?.length || 0,
        totalFolders: folders || 0,
        storageUsed: files?.reduce((sum, f) => sum + (f.size || 0), 0) || 0,
        wsprMessages: messages || 0,
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

  if (loading) return <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-12 w-12 border-4 border-samurai-red border-t-transparent"></div></div>

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white mb-6">Resource Usage</h3>
      {stats.map((stat) => (
        <div key={stat.userId} className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-4">
          <h4 className="text-white font-bold mb-3">{stat.displayName} ({stat.email})</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-samurai-grey-darker p-3 rounded">
              <HardDrive size={16} className="text-samurai-red mb-1" />
              <p className="text-white font-bold">{formatBytes(stat.storageUsed)}</p>
              <p className="text-samurai-steel text-xs">{stat.totalFiles} files</p>
            </div>
            <div className="bg-samurai-grey-darker p-3 rounded">
              <Database size={16} className="text-samurai-red mb-1" />
              <p className="text-white font-bold">{stat.totalFolders}</p>
              <p className="text-samurai-steel text-xs">folders</p>
            </div>
            <div className="bg-samurai-grey-darker p-3 rounded">
              <Network size={16} className="text-samurai-red mb-1" />
              <p className="text-white font-bold">{stat.wsprMessages}</p>
              <p className="text-samurai-steel text-xs">messages</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
