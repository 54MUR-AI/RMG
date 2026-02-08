import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import FileUpload from '../components/ldgr/FileUpload'
import FileList from '../components/ldgr/FileList'
import FolderView from '../components/ldgr/FolderView'
import { Lock, Shield, Zap, BookOpen } from 'lucide-react'
import { uploadFile, getUserFiles, downloadFile, deleteFile, moveFile } from '../lib/ldgr/storage'
import type { FileMetadata } from '../lib/ldgr/storage'
import { getFoldersByParent, createFolder, renameFolder, deleteFolder, getFolderPath, countFilesInFolder } from '../lib/ldgr/folders'
import type { Folder } from '../lib/ldgr/folders'

export default function LdgrPage() {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [currentPath, setCurrentPath] = useState<Folder[]>([])
  const [folderFileCounts, setFolderFileCounts] = useState<Record<string, number>>({})
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (user) {
      loadFiles()
      loadFolders()
      loadFolderPath()
    }
  }, [user, currentFolderId])

  const loadFiles = async () => {
    if (!user) return
    try {
      setLoading(true)
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
      
      const counts: Record<string, number> = {}
      for (const folder of userFolders) {
        counts[folder.id] = await countFilesInFolder(folder.id)
      }
      counts[currentFolderId || 'root'] = await countFilesInFolder(currentFolderId)
      setFolderFileCounts(counts)
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

  if (!user) {
    return (
      <div className="min-h-screen bg-samurai-black flex items-center justify-center p-4">
        <div className="text-center">
          <Lock className="w-16 h-16 text-samurai-red mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-2 neon-text">LDGR</h2>
          <p className="text-white/70 mb-6">Please sign in to access your secure vault</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-samurai-black text-white">
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-6">
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Lock className="w-12 h-12 text-samurai-red" />
            <h1 className="text-5xl font-black neon-text">LDGR</h1>
          </div>
          <h2 className="text-3xl font-black mb-4 text-white">
            Military-Grade File Security
          </h2>
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Store and share files with AES-256 encryption, blockchain verification, and P2P transfer
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 px-6 py-3 bg-samurai-grey-darker border-2 border-samurai-red/30 rounded-full">
              <Lock className="w-5 h-5 text-samurai-red" />
              <span className="font-semibold">End-to-End Encrypted</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-samurai-grey-darker border-2 border-samurai-red/30 rounded-full">
              <Shield className="w-5 h-5 text-samurai-red" />
              <span className="font-semibold">Blockchain Verified</span>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-samurai-grey-darker border-2 border-samurai-red/30 rounded-full">
              <Zap className="w-5 h-5 text-samurai-red" />
              <span className="font-semibold">P2P Transfer</span>
            </div>
          </div>
        </div>

        <FileUpload onFileUpload={handleFileUpload} uploading={uploading} />

        <div className="mt-8">
          <FolderView
            folders={folders}
            currentPath={currentPath}
            onFolderClick={handleFolderClick}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            fileCount={folderFileCounts}
            onMoveFile={handleMoveFile}
          />
        </div>

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
              onDelete={handleFileDelete}
              onMoveFile={handleMoveFile}
            />
          </div>
        ) : (
          <div className="mt-12 text-center text-white/50">
            <p>No files yet. Upload your first file above!</p>
          </div>
        )}
      </main>

      {/* README Button */}
      <button
        onClick={() => window.open('https://github.com/54MUR-AI/ldgr#readme', '_blank')}
        className="fixed bottom-6 right-6 p-4 bg-samurai-red text-white rounded-full shadow-lg shadow-samurai-red/50 hover:bg-samurai-red-dark transition-all hover:scale-110 z-40"
        aria-label="README"
      >
        <BookOpen className="w-6 h-6" />
      </button>
    </div>
  )
}
