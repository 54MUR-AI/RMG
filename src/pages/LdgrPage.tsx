import { useState, useEffect } from 'react'
import { FolderOpen, Key, Lock, Vault, Briefcase } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import FileUpload from '../components/ldgr/FileUpload'
import FileList from '../components/ldgr/FileList'
import FolderView from '../components/ldgr/FolderView'
import ApiKeyManager from '../components/ldgr/ApiKeyManager'
import PasswordManager from '../components/ldgr/PasswordManager'
import CryptoWallet from '../components/ldgr/CryptoWallet'
import ReadmePopup from '../components/ReadmePopup'
import LdgrSettings from '../components/ldgr/LdgrSettings'
import { uploadFile, getUserFiles, getSharedFiles, downloadFile, deleteFile, moveFile } from '../lib/ldgr/storage'
import type { FileMetadata } from '../lib/ldgr/storage'
import { getFoldersByParent, createFolder, renameFolder, deleteFolder, getFolderPath, countFilesInFolder, countSubfoldersInFolder, ensureDefaultFolders } from '../lib/ldgr/folders'
import type { Folder } from '../lib/ldgr/folders'

export default function LdgrPage() {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<Folder[]>([])
  const [folderFileCounts, setFolderFileCounts] = useState<Record<string, number>>({})
  const [folderSubfolderCounts, setFolderSubfolderCounts] = useState<Record<string, number>>({})
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showReadme, setShowReadme] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<'files' | 'passwords' | 'assets' | 'api-keys'>('files')
  const [isDropsFolder, setIsDropsFolder] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Listen for footer button events
  useEffect(() => {
    const onReadme = () => setShowReadme(true)
    const onSettings = () => setShowSettings(true)
    window.addEventListener('rmg:readme', onReadme)
    window.addEventListener('rmg:settings', onSettings)
    return () => {
      window.removeEventListener('rmg:readme', onReadme)
      window.removeEventListener('rmg:settings', onSettings)
    }
  }, [])

  useEffect(() => {
    if (user) {
      ensureDefaultFolders(user.id).catch(console.error)
      loadFiles()
      loadFolders()
      loadFolderPath()
    }
  }, [user, currentFolderId])

  const loadFiles = async () => {
    if (!user) return
    try {
      setLoading(true)

      // Check if current folder is the Drops folder
      if (currentFolderId) {
        const { data: folderData } = await supabase
          .from('folders')
          .select('name, parent_id')
          .eq('id', currentFolderId)
          .single()

        if (folderData?.name === 'Drops' && folderData?.parent_id === null) {
          setIsDropsFolder(true)
          const sharedFiles = await getSharedFiles(user.id)
          setFiles(sharedFiles)
          return
        }
      }

      setIsDropsFolder(false)
      const userFiles = await getUserFiles(user.id, currentFolderId)
      setFiles(userFiles)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFolders = async () => {
    if (!user) return
    try {
      const userFolders = await getFoldersByParent(user.id, currentFolderId)
      setFolders(userFolders)
      
      const fileCounts: Record<string, number> = {}
      const subfolderCounts: Record<string, number> = {}
      
      for (const folder of userFolders) {
        fileCounts[folder.id] = await countFilesInFolder(folder.id)
        subfolderCounts[folder.id] = await countSubfoldersInFolder(folder.id)
      }
      fileCounts[currentFolderId || 'root'] = await countFilesInFolder(currentFolderId)
      subfolderCounts[currentFolderId || 'root'] = await countSubfoldersInFolder(currentFolderId)
      
      setFolderFileCounts(fileCounts)
      setFolderSubfolderCounts(subfolderCounts)
    } catch (error) {
      console.error('Error loading folders:', error)
    }
  }

  const loadFolderPath = async () => {
    if (!user) return
    try {
      const path = await getFolderPath(currentFolderId)
      setCurrentPath(path)
    } catch (error) {
      console.error('Error loading folder path:', error)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!user) return
    
    try {
      setUploading(true)
      const metadata = await uploadFile(file, user.id, user.email!, currentFolderId)
      setFiles(prev => [metadata, ...prev])
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload file. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleFileDownload = async (file: FileMetadata) => {
    if (!user) return
    
    try {
      await downloadFile(file, user.id, user.email!)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Failed to download file. Please try again.')
    }
  }

  const handleFileDelete = async (file: FileMetadata) => {
    if (!user) return
    
    if (!confirm(`Delete "${file.name}"?`)) return
    
    try {
      await deleteFile(file)
      setFiles(prev => prev.filter(f => f.id !== file.id))
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete file. Please try again.')
    }
  }

  const handleFolderClick = (folderId: string | null) => {
    setCurrentFolderId(folderId)
  }

  const handleCreateFolder = async (name: string, parentId: string | null) => {
    if (!user) return
    try {
      const newFolder = await createFolder(user.id, name, parentId)
      setFolders(prev => [...prev, newFolder])
    } catch (error) {
      console.error('Create folder failed:', error)
      alert('Failed to create folder. Please try again.')
    }
  }

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await renameFolder(folderId, newName)
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: newName } : f))
    } catch (error) {
      console.error('Rename folder failed:', error)
      alert('Failed to rename folder. Please try again.')
    }
  }

  const handleDeleteFolder = async (folderId: string) => {
    try {
      await deleteFolder(folderId)
      setFolders(prev => prev.filter(f => f.id !== folderId))
    } catch (error) {
      console.error('Delete folder failed:', error)
      alert('Failed to delete folder. Please try again.')
    }
  }

  const handleMoveFile = async (fileId: string, folderId: string | null) => {
    try {
      await moveFile(fileId, folderId)
      await loadFiles()
      await loadFolders()
    } catch (error) {
      console.error('Move file failed:', error)
      alert('Failed to move file. Please try again.')
    }
  }

  const handleReorderFolders = async (reorderedFolders: Folder[]): Promise<void> => {
    try {
      // Optimistically update UI
      setFolders(reorderedFolders)
      // Persist to database
      const { reorderFolders } = await import('../lib/ldgr/folders')
      await reorderFolders(reorderedFolders)
    } catch (error) {
      console.error('Reorder folders failed:', error)
      alert('Failed to reorder folders. Please try again.')
      // Reload folders on error
      await loadFolders()
    }
  }

  if (!user) {
    return (
      <div className="bg-samurai-black flex items-center justify-center p-4 py-32">
        <div className="text-center">
          <Vault className="w-16 h-16 text-samurai-red mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2 neon-text">LDGR</h2>
          <p className="text-white/70 mb-6">Please sign in to access your secure vault</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-samurai-black text-white min-h-full">
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-4">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Vault className="w-8 h-8 text-samurai-red" />
            <h1 className="text-3xl font-black neon-text">LDGR</h1>
          </div>
          <p className="text-sm text-white/60 mb-4">
            Layered Decentralized Global Registry
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all relative ${
              activeTab === 'files'
                ? 'text-samurai-red'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <FolderOpen className="w-5 h-5" />
            <span className={`hidden md:inline ${activeTab === 'files' ? 'underline decoration-2 underline-offset-4' : ''}`}>
              Files
            </span>
          </button>
          <button
            onClick={() => setActiveTab('passwords')}
            className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all relative ${
              activeTab === 'passwords'
                ? 'text-samurai-red'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Lock className="w-5 h-5" />
            <span className={`hidden md:inline ${activeTab === 'passwords' ? 'underline decoration-2 underline-offset-4' : ''}`}>
              Passwords
            </span>
          </button>
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all relative ${
              activeTab === 'assets'
                ? 'text-samurai-red'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className={`hidden md:inline ${activeTab === 'assets' ? 'underline decoration-2 underline-offset-4' : ''}`}>
              Assets
            </span>
          </button>
          <button
            onClick={() => setActiveTab('api-keys')}
            className={`flex items-center gap-2 px-4 py-2 font-semibold transition-all relative ${
              activeTab === 'api-keys'
                ? 'text-samurai-red'
                : 'text-white/70 hover:text-white'
            }`}
          >
            <Key className="w-5 h-5" />
            <span className={`hidden md:inline ${activeTab === 'api-keys' ? 'underline decoration-2 underline-offset-4' : ''}`}>
              API Keys
            </span>
          </button>
        </div>

        {/* Files Tab */}
        {activeTab === 'files' && (
          <>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <FolderOpen className="w-6 h-6 text-samurai-red" />
                File Manager
              </h2>
              <p className="text-white/70 text-sm mt-1 hidden sm:block">
                Securely store and manage encrypted files across IPFS, cloud, and P2P networks
              </p>
            </div>

            {!isDropsFolder && (
              <FileUpload onFileUpload={handleFileUpload} uploading={uploading} />
            )}

            <div className="mt-8">
              <FolderView
                folders={folders}
                currentPath={currentPath}
                onFolderClick={handleFolderClick}
                onCreateFolder={handleCreateFolder}
                onRenameFolder={handleRenameFolder}
                onDeleteFolder={handleDeleteFolder}
                onReorderFolders={handleReorderFolders}
                fileCount={folderFileCounts}
                subfolderCount={folderSubfolderCounts}
                onMoveFile={handleMoveFile}
                userId={user.id}
              />
            </div>

            {isDropsFolder && (
              <div className="mt-6 mb-4 glass-card p-4 rounded-xl border border-samurai-red/20">
                <p className="text-samurai-red font-semibold text-sm">📥 Drops — Files shared with you</p>
                <p className="text-white/50 text-xs mt-1">Files shared via WSPR DMs and channels appear here. Download to decrypt.</p>
              </div>
            )}

            {loading ? (
              <div className="mt-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
                <p className="mt-4 text-white/70">Loading your files...</p>
              </div>
            ) : files.length > 0 ? (
              <div className="mt-12">
                <FileList 
                  files={files} 
                  onDownload={handleFileDownload}
                  onDelete={isDropsFolder ? undefined : handleFileDelete}
                  onMoveFile={isDropsFolder ? undefined : handleMoveFile}
                />
              </div>
            ) : (
              <div className="mt-12 text-center text-white/50">
                <p>{isDropsFolder ? 'No files have been shared with you yet.' : 'No files yet. Upload your first file above!'}</p>
              </div>
            )}
          </>
        )}

        {/* Passwords Tab */}
        {activeTab === 'passwords' && (
          <PasswordManager />
        )}

        {/* Assets Tab */}
        {activeTab === 'assets' && (
          <CryptoWallet />
        )}

        {/* API Keys Tab */}
        {activeTab === 'api-keys' && (
          <ApiKeyManager />
        )}
      </main>

      {/* README Popup */}
      {showReadme && (
        <ReadmePopup
          readmeUrl="/appReadmes/ldgr.md"
          onClose={() => setShowReadme(false)}
        />
      )}

      {/* Settings Modal */}
      <LdgrSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
