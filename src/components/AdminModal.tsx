import { useState } from 'react'
import { X, Users, Database, Server, Settings, Shield } from 'lucide-react'
import { useAdmin } from '../contexts/AdminContext'
import ModalPortal from './ModalPortal'
import AdminUsersTab from './admin/AdminUsersTab'
import AdminResourcesTab from './admin/AdminResourcesTab'
import AdminAppsTab from './admin/AdminAppsTab'
import AdminSystemTab from './admin/AdminSystemTab'

interface AdminModalProps {
  onClose: () => void
}

type TabType = 'users' | 'resources' | 'apps' | 'system'

export default function AdminModal({ onClose }: AdminModalProps) {
  const { isAdmin } = useAdmin()
  const [activeTab, setActiveTab] = useState<TabType>('users')

  if (!isAdmin) return null

  return (
    <ModalPortal>
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] p-4">
        <div className="bg-samurai-grey-darker border-2 border-samurai-red rounded-xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-samurai-black border-b-2 border-samurai-red p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="text-samurai-red" size={32} />
              <h2 className="text-3xl font-black text-white neon-text">Admin Control Panel</h2>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-samurai-red transition-colors">
              <X size={28} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-samurai-steel-dark bg-samurai-black">
            {[
              { id: 'users', icon: Users, label: 'Users' },
              { id: 'resources', icon: Database, label: 'Resources' },
              { id: 'apps', icon: Server, label: 'Apps' },
              { id: 'system', icon: Settings, label: 'System' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-4 font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-samurai-red text-white border-b-2 border-samurai-red'
                    : 'text-samurai-steel hover:text-white hover:bg-samurai-grey-darker'
                }`}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'users' && <AdminUsersTab />}
            {activeTab === 'resources' && <AdminResourcesTab />}
            {activeTab === 'apps' && <AdminAppsTab />}
            {activeTab === 'system' && <AdminSystemTab />}
          </div>
        </div>
      </div>
    </ModalPortal>
  )
}
