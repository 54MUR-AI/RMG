import { useState, useEffect } from 'react'
import { Globe, Server, RefreshCw } from 'lucide-react'

interface ServiceDef {
  name: string
  url: string
  type: 'frontend' | 'backend'
}

interface ServiceStatus extends ServiceDef {
  status: 'online' | 'offline' | 'checking'
  responseMs: number | null
  lastChecked: string
}

const SERVICES: { group: string; items: ServiceDef[] }[] = [
  {
    group: 'RMG',
    items: [
      { name: 'RMG', url: 'https://roninmedia.studio', type: 'frontend' },
    ],
  },
  {
    group: 'N-SIT',
    items: [
      { name: 'N-SIT', url: 'https://nsit-rmg.onrender.com', type: 'frontend' },
    ],
  },
  {
    group: 'SCRP',
    items: [
      { name: 'SCRP Frontend', url: 'https://scrp-rmg.onrender.com', type: 'frontend' },
      { name: 'SCRP API', url: 'https://scrp-api.onrender.com', type: 'backend' },
    ],
  },
  {
    group: 'WSPR',
    items: [
      { name: 'WSPR Frontend', url: 'https://wspr-rmg.onrender.com', type: 'frontend' },
      { name: 'WSPR API', url: 'https://wspr-api.onrender.com', type: 'backend' },
    ],
  },
  {
    group: 'OMNI',
    items: [
      { name: 'OMNI Frontend', url: 'https://omni-rmg.onrender.com', type: 'frontend' },
      { name: 'OMNI API', url: 'https://omni-api-ij2y.onrender.com', type: 'backend' },
    ],
  },
]

async function checkService(svc: ServiceDef): Promise<ServiceStatus> {
  const start = performance.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)
    await fetch(svc.url, { method: 'HEAD', mode: 'no-cors', signal: controller.signal })
    clearTimeout(timeout)
    const ms = Math.round(performance.now() - start)
    return { ...svc, status: 'online', responseMs: ms, lastChecked: new Date().toISOString() }
  } catch {
    return { ...svc, status: 'offline', responseMs: null, lastChecked: new Date().toISOString() }
  }
}

function latencyColor(ms: number | null): string {
  if (ms === null) return 'text-red-400'
  if (ms < 500) return 'text-green-400'
  if (ms < 2000) return 'text-yellow-400'
  return 'text-orange-400'
}

export default function AdminAppsTab() {
  const [statuses, setStatuses] = useState<Map<string, ServiceStatus>>(new Map())
  const [loading, setLoading] = useState(false)

  const checkAll = async () => {
    setLoading(true)
    const allServices = SERVICES.flatMap(g => g.items)
    // Set all to checking
    const checking = new Map<string, ServiceStatus>()
    allServices.forEach(s => checking.set(s.url, { ...s, status: 'checking', responseMs: null, lastChecked: '' }))
    setStatuses(new Map(checking))

    const results = await Promise.all(allServices.map(checkService))
    const map = new Map<string, ServiceStatus>()
    results.forEach(r => map.set(r.url, r))
    setStatuses(map)
    setLoading(false)
  }

  useEffect(() => { checkAll() }, [])

  const allStatuses = Array.from(statuses.values())
  const onlineCount = allStatuses.filter(s => s.status === 'online').length
  const totalCount = allStatuses.length

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg sm:text-2xl font-bold text-white">Application Status</h3>
        {totalCount > 0 && (
          <span className="text-xs sm:text-sm text-samurai-steel">
            <span className={onlineCount === totalCount ? 'text-green-400 font-bold' : 'text-yellow-400 font-bold'}>{onlineCount}</span>/{totalCount} online
          </span>
        )}
      </div>

      {SERVICES.map(group => (
        <div key={group.group}>
          <h4 className="text-xs font-bold text-samurai-steel uppercase tracking-wider mb-2">{group.group}</h4>
          <div className="space-y-2">
            {group.items.map(svc => {
              const s = statuses.get(svc.url)
              return (
                <div key={svc.url} className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      s?.status === 'online' ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
                        : s?.status === 'checking' ? 'bg-yellow-500 animate-pulse'
                        : s?.status === 'offline' ? 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                        : 'bg-samurai-steel-dark'
                    }`} />
                    {svc.type === 'frontend'
                      ? <Globe size={14} className="text-samurai-steel flex-shrink-0" />
                      : <Server size={14} className="text-samurai-steel flex-shrink-0" />
                    }
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs sm:text-sm text-white font-bold">{svc.name}</h5>
                      <p className="text-samurai-steel text-[10px] sm:text-xs truncate">{svc.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {s?.responseMs !== null && s?.status === 'online' && (
                      <span className={`text-[10px] sm:text-xs font-mono ${latencyColor(s.responseMs)}`}>
                        {s.responseMs}ms
                      </span>
                    )}
                    <span className={`text-xs sm:text-sm font-bold ${
                      s?.status === 'online' ? 'text-green-400'
                        : s?.status === 'checking' ? 'text-yellow-400'
                        : s?.status === 'offline' ? 'text-red-400'
                        : 'text-samurai-steel'
                    }`}>
                      {s?.status === 'checking' ? 'Checking...' : s?.status === 'online' ? 'Online' : s?.status === 'offline' ? 'Offline' : '—'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <button onClick={checkAll} disabled={loading} className="w-full py-2.5 sm:py-3 bg-samurai-red hover:bg-samurai-red-dark text-white font-bold rounded-lg text-sm sm:text-base disabled:opacity-50 flex items-center justify-center gap-2">
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        {loading ? 'Checking...' : 'Refresh All'}
      </button>
    </div>
  )
}
