import { FileText, Lock, Download, Share2, Trash2, Image as ImageIcon, FileVideo, FileAudio, File } from 'lucide-react'
import type { FileMetadata } from '../lib/storage'

interface FileListProps {
  files: FileMetadata[]
  onDownload: (file: FileMetadata) => void
  onDelete: (file: FileMetadata) => void
  onMoveFile?: (fileId: string, folderId: string | null) => void
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function getFileIcon(filename: string) {
  const ext = filename.toLowerCase()
  if (ext.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp)$/)) return ImageIcon
  if (ext.match(/\.(mp4|mov|avi|mkv|webm)$/)) return FileVideo
  if (ext.match(/\.(mp3|wav|ogg|flac)$/)) return FileAudio
  return FileText
}

function FileThumbnail({ file }: { file: FileMetadata }) {
  const Icon = getFileIcon(file.name)
  
  return (
    <div className="flex items-center justify-center w-full h-32 mb-4 rounded-lg bg-gradient-to-br from-samurai-grey-dark/50 to-samurai-red/10 border border-samurai-red/20">
      <Icon className="w-16 h-16 text-samurai-red/60" />
    </div>
  )
}

export default function FileList({ files, onDownload, onDelete, onMoveFile }: FileListProps) {
  const handleDragStart = (e: React.DragEvent, file: FileMetadata) => {
    e.dataTransfer.setData('fileId', file.id)
    e.dataTransfer.effectAllowed = 'move'
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div
            key={file.id}
            draggable={!!onMoveFile}
            onDragStart={(e) => onMoveFile && handleDragStart(e, file)}
            className="bg-samurai-grey-darker border-2 border-samurai-red/30 rounded-xl p-6 hover:border-samurai-red transition-all duration-300 hover:shadow-lg hover:shadow-samurai-red/20 cursor-move"
          >
            <FileThumbnail file={file} />
            
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{file.name}</h3>
                  <p className="text-sm text-white/70">{formatFileSize(file.size)}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className="flex items-center gap-1 px-3 py-1 bg-samurai-red/20 border border-samurai-red/50 rounded-full text-samurai-red">
                <Lock className="w-3 h-3" />
                Encrypted
              </span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => onDownload(file)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-samurai-grey-dark hover:bg-samurai-red/20 border border-samurai-red/30 hover:border-samurai-red rounded-lg transition-all duration-300"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-semibold">Download</span>
              </button>
              <button 
                className="flex items-center justify-center px-4 py-2 bg-samurai-grey-dark hover:bg-samurai-red/20 border border-samurai-red/30 hover:border-samurai-red rounded-lg transition-all duration-300"
                title="Share (Coming Soon)"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDelete(file)}
                className="flex items-center justify-center px-4 py-2 bg-samurai-grey-dark hover:bg-red-900/20 border border-samurai-red/30 hover:border-red-500 rounded-lg transition-all duration-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
