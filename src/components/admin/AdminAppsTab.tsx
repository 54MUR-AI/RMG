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
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-white mb-6">Application Status</h3>
      {apps.map((app) => (
        <div key={app.name} className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${app.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <h4 className="text-white font-bold">{app.name}</h4>
              <p className="text-samurai-steel text-sm">{app.url}</p>
            </div>
          </div>
          <p className="text-white font-bold capitalize">{app.status}</p>
        </div>
      ))}
      <button onClick={checkApps} disabled={loading} className="w-full py-3 bg-samurai-red hover:bg-samurai-red-dark text-white font-bold rounded-lg">
        {loading ? 'Checking...' : 'Refresh Status'}
      </button>
    </div>
  )
}
