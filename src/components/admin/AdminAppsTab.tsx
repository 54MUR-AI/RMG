import { useState, useEffect } from 'react'

interface AppStatus {
  name: string
  url: string
  status: 'online' | 'offline'
  lastChecked: string
}

export default function AdminAppsTab() {
  const [apps, setApps] = useState<AppStatus[]>([])
  const [loading, setLoading] = useState(false)

  const checkApps = async () => {
    setLoading(true)
    const appList = [
      { name: 'WSPR', url: 'https://wspr-web.onrender.com' },
      { name: 'SCRP', url: 'https://scrp-backend.onrender.com' },
      { name: 'RMG', url: 'https://roninmedia.studio' },
    ]

    const statuses = await Promise.all(appList.map(async (app) => {
      try {
        await fetch(app.url, { method: 'HEAD', mode: 'no-cors' })
        return { ...app, status: 'online' as const, lastChecked: new Date().toISOString() }
      } catch {
        return { ...app, status: 'offline' as const, lastChecked: new Date().toISOString() }
      }
    }))

    setApps(statuses)
    setLoading(false)
  }

  useEffect(() => {
    checkApps()
  }, [])

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">Application Status</h3>
      {apps.map((app) => (
        <div key={app.name} className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0 ${app.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm sm:text-base text-white font-bold">{app.name}</h4>
              <p className="text-samurai-steel text-xs sm:text-sm break-all">{app.url}</p>
            </div>
          </div>
          <p className="text-sm sm:text-base text-white font-bold capitalize self-start sm:self-auto">{app.status}</p>
        </div>
      ))}
      <button onClick={checkApps} disabled={loading} className="w-full py-2.5 sm:py-3 bg-samurai-red hover:bg-samurai-red-dark text-white font-bold rounded-lg text-sm sm:text-base disabled:opacity-50">
        {loading ? 'Checking...' : 'Refresh Status'}
      </button>
    </div>
  )
}
