import { useState } from 'react'
import { Folder as FolderIcon, FolderPlus, Edit2, Trash2, ChevronRight, Home } from 'lucide-react'
import type { Folder } from '../lib/folders'

interface FolderViewProps {
  folders: Folder[]
  currentPath: Folder[]
  onFolderClick: (folderId: string | null) => void
  onCreateFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (folderId: string, newName: string) => void
  onDeleteFolder: (folderId: string) => void
  fileCount: Record<string, number>
  onMoveFile?: (fileId: string, folderId: string | null) => void
}

export default function FolderView({
  folders,
  currentPath,
  onFolderClick,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  fileCount,
  onMoveFile
}: FolderViewProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), currentFolderId)
      setNewFolderName('')
      setIsCreating(false)
    }
  }

  const handleRename = (folderId: string) => {
    if (editName.trim()) {
      onRenameFolder(folderId, editName.trim())
      setEditingId(null)
      setEditName('')
    }
  }

  const startEdit = (folder: Folder) => {
    setEditingId(folder.id)
    setEditName(folder.name)
  }

  const handleDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverId(folderId)
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    const fileId = e.dataTransfer.getData('fileId')
    if (fileId && onMoveFile) {
      onMoveFile(fileId, folderId)
    }
    setDragOverId(null)
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => onFolderClick(null)}
            className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-samurai-grey-dark transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Vault</span>
          </button>
          
          {currentPath.map((folder, index) => (
            <div key={folder.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-white/30" />
              <button
                onClick={() => onFolderClick(folder.id)}
                className="px-3 py-2 rounded-lg hover:bg-samurai-grey-dark transition-colors"
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>
        
        {/* File count for current folder */}
        <div className="text-sm text-white/50">
          {fileCount[currentFolderId || 'root'] || 0} files in this folder
        </div>
      </div>

      {/* Create Folder Button */}
      <div className="flex items-center gap-4">
        {!isCreating ? (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-samurai-red hover:bg-samurai-red-dark rounded-lg transition-colors"
          >
            <FolderPlus className="w-5 h-5" />
            <span className="font-semibold">New Folder</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate()
                if (e.key === 'Escape') {
                  setIsCreating(false)
                  setNewFolderName('')
                }
              }}
              placeholder="Folder name..."
              autoFocus
              className="px-4 py-2 bg-samurai-grey-dark border-2 border-samurai-red/50 rounded-lg text-white placeholder-white/50 focus:border-samurai-red focus:outline-none"
            />
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-samurai-red hover:bg-samurai-red-dark rounded-lg transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => {
                setIsCreating(false)
                setNewFolderName('')
              }}
              className="px-4 py-2 bg-samurai-grey-dark hover:bg-samurai-grey-darker rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Folders Grid */}
      {folders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              onDragOver={(e) => onMoveFile && handleDragOver(e, folder.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => onMoveFile && handleDrop(e, folder.id)}
              className={`group relative bg-samurai-grey-darker border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-samurai-red/20 ${
                dragOverId === folder.id
                  ? 'border-samurai-red bg-samurai-red/10 scale-105'
                  : 'border-samurai-red/30 hover:border-samurai-red'
              }`}
            >
              {editingId === folder.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(folder.id)
                      if (e.key === 'Escape') {
                        setEditingId(null)
                        setEditName('')
                      }
                    }}
                    autoFocus
                    className="w-full px-2 py-1 bg-samurai-grey-dark border border-samurai-red/50 rounded text-white text-sm focus:border-samurai-red focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRename(folder.id)}
                      className="flex-1 px-2 py-1 bg-samurai-red hover:bg-samurai-red-dark rounded text-xs transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null)
                        setEditName('')
                      }}
                      className="flex-1 px-2 py-1 bg-samurai-grey-dark hover:bg-samurai-grey-darker rounded text-xs transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onFolderClick(folder.id)}
                    className="w-full text-left"
                  >
                    <div className="flex flex-col items-center gap-2 mb-2">
                      <FolderIcon className="w-12 h-12 text-samurai-red/80" />
                      <div className="w-full">
                        <h3 className="font-bold text-white truncate text-center">{folder.name}</h3>
                        <p className="text-xs text-white/50 text-center">
                          {fileCount[folder.id] || 0} files
                        </p>
                      </div>
                    </div>
                  </button>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        startEdit(folder)
                      }}
                      className="p-1.5 bg-samurai-grey-dark hover:bg-samurai-red/20 rounded transition-colors"
                      title="Rename"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm(`Delete folder "${folder.name}" and all its contents?`)) {
                          onDeleteFolder(folder.id)
                        }
                      }}
                      className="p-1.5 bg-samurai-grey-dark hover:bg-red-900/20 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
