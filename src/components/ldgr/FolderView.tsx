import { useState } from 'react'
import { Folder as FolderIcon, FolderPlus, Edit2, Trash2, ChevronRight, Home, Users } from 'lucide-react'
import type { Folder } from '../../lib/ldgr/folders'

interface FolderViewProps {
  folders: Folder[]
  currentPath: Folder[]
  onFolderClick: (folderId: string | null) => void
  onCreateFolder: (name: string, parentId: string | null) => void
  onRenameFolder: (folderId: string, newName: string) => void
  onDeleteFolder: (folderId: string) => void
  onReorderFolders: (folders: Folder[]) => void | Promise<void>
  fileCount: Record<string, number>
  onMoveFile?: (fileId: string, folderId: string | null) => void
  userId: string
}

export default function FolderView({
  folders,
  currentPath,
  onFolderClick,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onReorderFolders,
  fileCount,
  onMoveFile,
  userId
}: FolderViewProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null)
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null)

  const currentFolderId = currentPath.length > 0 ? currentPath[currentPath.length - 1].id : null

  const handleCreate = () => {
    const trimmedName = newFolderName.trim()
    if (trimmedName) {
      // Check for duplicate folder names in current directory
      const isDuplicate = folders.some(
        folder => folder.name.toLowerCase() === trimmedName.toLowerCase()
      )
      
      if (isDuplicate) {
        alert(`A folder named "${trimmedName}" already exists in this location.`)
        return
      }
      
      onCreateFolder(trimmedName, currentFolderId)
      setNewFolderName('')
      setIsCreating(false)
    }
  }

  const handleRename = (folderId: string) => {
    const trimmedName = editName.trim()
    if (trimmedName) {
      // Check for duplicate folder names in current directory (excluding current folder)
      const isDuplicate = folders.some(
        folder => folder.id !== folderId && folder.name.toLowerCase() === trimmedName.toLowerCase()
      )
      
      if (isDuplicate) {
        alert(`A folder named "${trimmedName}" already exists in this location.`)
        return
      }
      
      onRenameFolder(folderId, trimmedName)
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

  const handleFolderDragStart = (e: React.DragEvent, folderId: string) => {
    setDraggedFolderId(folderId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('folderId', folderId)
  }

  const handleFolderDragOver = (e: React.DragEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    const draggedId = e.dataTransfer.types.includes('folderId')
    if (draggedId && draggedFolderId !== folderId) {
      setDragOverFolderId(folderId)
    }
  }

  const handleFolderDragLeave = () => {
    setDragOverFolderId(null)
  }

  const handleFolderDrop = (e: React.DragEvent, targetFolderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    const draggedId = draggedFolderId
    if (!draggedId || draggedId === targetFolderId) {
      setDraggedFolderId(null)
      setDragOverFolderId(null)
      return
    }

    // Reorder folders
    const draggedIndex = folders.findIndex(f => f.id === draggedId)
    const targetIndex = folders.findIndex(f => f.id === targetFolderId)
    
    if (draggedIndex !== -1 && targetIndex !== -1) {
      const reordered = [...folders]
      const [removed] = reordered.splice(draggedIndex, 1)
      reordered.splice(targetIndex, 0, removed)
      
      // Update display_order for all affected folders
      reordered.forEach((folder, index) => {
        folder.display_order = index
      })
      
      // Call parent to persist the changes
      onReorderFolders(reordered)
    }

    setDraggedFolderId(null)
    setDragOverFolderId(null)
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
          
          {currentPath.map((folder) => (
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
              draggable={!editingId}
              onDragStart={(e) => handleFolderDragStart(e, folder.id)}
              onDragOver={(e) => {
                if (onMoveFile) handleDragOver(e, folder.id)
                handleFolderDragOver(e, folder.id)
              }}
              onDragLeave={() => {
                handleDragLeave()
                handleFolderDragLeave()
              }}
              onDrop={(e) => {
                if (onMoveFile) handleDrop(e, folder.id)
                handleFolderDrop(e, folder.id)
              }}
              className={`group relative bg-samurai-grey-darker border-2 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-samurai-red/20 cursor-move ${
                dragOverId === folder.id
                  ? 'border-samurai-red bg-samurai-red/10 scale-105'
                  : dragOverFolderId === folder.id
                  ? 'border-blue-500 bg-blue-500/10 scale-105'
                  : draggedFolderId === folder.id
                  ? 'opacity-50'
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
                      <div className="relative">
                        <FolderIcon className="w-12 h-12 text-samurai-red/80" />
                        {folder.user_id !== userId && (
                          <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1" title="Shared folder">
                            <Users className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="w-full">
                        <h3 className="font-bold text-white truncate text-center">{folder.name}</h3>
                        <p className="text-xs text-white/50 text-center">
                          {folder.user_id !== userId && <span className="text-blue-400">Shared • </span>}
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
