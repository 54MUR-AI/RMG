import { Cpu } from 'lucide-react'

export default function AdminSystemTab() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-2xl font-bold text-white mb-4 sm:mb-6">System Information</h3>
      
      <div className="bg-samurai-black border border-samurai-steel-dark rounded-lg p-3 sm:p-6">
        <h4 className="text-sm sm:text-base text-white font-bold mb-3 sm:mb-4 flex items-center gap-2">
          <Cpu size={16} className="text-samurai-red sm:w-5 sm:h-5" />
          Quick Actions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <button className="py-2.5 sm:py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg text-sm sm:text-base">Clear Cache</button>
          <button className="py-2.5 sm:py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg text-sm sm:text-base">Export Logs</button>
          <button className="py-2.5 sm:py-3 bg-samurai-steel-dark hover:bg-samurai-steel text-white font-bold rounded-lg text-sm sm:text-base">Backup DB</button>
          <button className="py-2.5 sm:py-3 bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold rounded-lg text-sm sm:text-base">Maintenance</button>
        </div>
      </div>
    </div>
  )
}
