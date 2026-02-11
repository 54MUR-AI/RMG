import { Cpu } from 'lucide-react'

export default function AdminSystemTab() {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white mb-6">System Information</h3>
      
      <div className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-6">
        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
          <Cpu size={20} className="text-samurai-red" />
          Quick Actions
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg">Clear Cache</button>
          <button className="py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg">Export Logs</button>
          <button className="py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg">Backup DB</button>
          <button className="py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold rounded-lg">Maintenance</button>
        </div>
      </div>
    </div>
  )
}
