import { useState, useEffect } from 'react'
import { X, File, Folder, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface LdgrFile {
  id: string
  name: string
  size: number
  type: string
  folder_id: string | null
  created_at: string
}

interface LdgrFolder {
  id: string
  name: string
  parent_id: string | null
}

interface LdgrFileBrowserModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectFile: (file: { id: string; name: string; size: number; type: string }) => void
  userId: string
}

export default function LdgrFileBrowserModal({ isOpen, onClose, onSelectFile, userId }: LdgrFileBrowserModalProps) {
  const [files, setFiles] = useState<LdgrFile[]>([])
  const [folders, setFolders] = useState<LdgrFolder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [folderPath, setFolderPath] = useState<LdgrFolder[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadFolderContents(currentFolderId)
    }
  }, [isOpen, currentFolderId, userId])

  const loadFolderContents = async (folderId: string | null) => {
    setIsLoading(true)
    try {
      // Load folders
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', userId)
        .eq('parent_id', folderId)
        .order('name', { ascending: true })

      if (foldersError) throw foldersError
      setFolders(foldersData || [])

      // Load files
      const { data: filesData, error: filesError } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', userId)
        .eq('folder_id', folderId)
        .order('name', { ascending: true })

      if (filesError) throw filesError
      setFiles(filesData || [])

      // Update folder path
      if (folderId) {
        const { data: folderData } = await supabase
          .from('folders')
          .select('*')
          .eq('id', folderId)
          .single()

        if (folderData) {
          // Build path by traversing up
          const path: LdgrFolder[] = [folderData]
          let currentFolder = folderData
          
          while (currentFolder.parent_id) {
            const { data: parentData } = await supabase
              .from('folders')
              .select('*')
              .eq('id', currentFolder.parent_id)
              .single()
            
            if (parentData) {
              path.unshift(parentData)
              currentFolder = parentData
            } else {
              break
            }
          }
          
          setFolderPath(path)
        }
      } else {
        setFolderPath([])
      }
    } catch (error) {
      console.error('Error loading folder contents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFolderClick = (folderId: string) => {
    setCurrentFolderId(folderId)
  }

  const handleBackClick = () => {
    if (folderPath.length > 0) {
      const parentFolder = folderPath[folderPath.length - 2]
      setCurrentFolderId(parentFolder?.id || null)
    } else {
      setCurrentFolderId(null)
    }
  }

  const handleFileSelect = (file: LdgrFile) => {
    onSelectFile({
      id: file.id,
      name: file.name,
      size: file.size,
      type: file.type
    })
    onClose()
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / 1024 / 1024).toFixed(1) + ' MB'
  }

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️'
    if (mimeType.startsWith('video/')) return '🎥'
    if (mimeType.startsWith('audio/')) return '🎵'
    if (mimeType.includes('pdf')) return '📕'
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦'
    if (mimeType.includes('text')) return '📝'
    return '📄'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-samurai-grey-dark">
          <h2 className="text-xl font-bold text-white">Browse LDGR Files</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-samurai-grey-darker rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-samurai-steel" />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-6 py-3 border-b border-samurai-grey-dark flex items-center gap-2 text-sm">
          <button
            onClick={() => setCurrentFolderId(null)}
            className="text-samurai-steel hover:text-white transition-colors"
          >
            LDGR
          </button>
          {folderPath.map((folder) => (
            <div key={folder.id} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-samurai-steel" />
              <button
                onClick={() => setCurrentFolderId(folder.id)}
                className="text-samurai-steel hover:text-white transition-colors"
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="text-center py-12 text-samurai-steel">
              Loading...
            </div>
          ) : (
            <div className="space-y-2">
              {/* Back button */}
              {currentFolderId && (
                <button
                  onClick={handleBackClick}
                  className="w-full p-3 glass-card rounded-lg hover:bg-samurai-grey-darker transition-colors flex items-center gap-3"
                >
                  <Folder className="w-5 h-5 text-samurai-red" />
                  <span className="text-white">.. (Back)</span>
                </button>
              )}

              {/* Folders */}
              {folders.map(folder => (
                <button
                  key={folder.id}
                  onClick={() => handleFolderClick(folder.id)}
                  className="w-full p-3 glass-card rounded-lg hover:bg-samurai-grey-darker transition-colors flex items-center gap-3"
                >
                  <Folder className="w-5 h-5 text-samurai-red" />
                  <span className="text-white">{folder.name}</span>
                </button>
              ))}

              {/* Files */}
              {files.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleFileSelect(file)}
                  className="w-full p-3 glass-card rounded-lg hover:bg-samurai-grey-darker transition-colors flex items-center gap-3"
                >
                  <span className="text-2xl">{getFileIcon(file.type)}</span>
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-samurai-steel">{formatFileSize(file.size)}</p>
                  </div>
                </button>
              ))}

              {/* Empty state */}
              {folders.length === 0 && files.length === 0 && (
                <div className="text-center py-12 text-samurai-steel">
                  <File className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No files or folders in this location</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-samurai-grey-dark flex justify-end">
          <button
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
