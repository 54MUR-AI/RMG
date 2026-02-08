import { useState, useCallback } from 'react'
import { Upload, Lock } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => void
  uploading?: boolean
}

export default function FileUpload({ onFileUpload, uploading = false }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFileUpload(files[0])
    }
  }, [onFileUpload])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onFileUpload(files[0])
    }
  }, [onFileUpload])

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300
        ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        ${isDragging 
          ? 'border-samurai-red bg-samurai-red/10 scale-105' 
          : 'border-samurai-red/30 bg-samurai-grey-darker hover:border-samurai-red hover:bg-samurai-grey-dark'
        }
      `}
      onDragEnter={uploading ? undefined : handleDrag}
      onDragLeave={uploading ? undefined : handleDrag}
      onDragOver={uploading ? undefined : handleDrag}
      onDrop={uploading ? undefined : handleDrop}
    >
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileInput}
        disabled={uploading}
      />
      
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <Upload className="w-16 h-16 text-samurai-red animate-glow-pulse" />
            <Lock className="w-8 h-8 text-white absolute -bottom-2 -right-2 bg-samurai-grey-darker rounded-full p-1" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Drop files here or click to upload
            </h3>
            <p className="text-white/70 mb-4">
              Files are encrypted client-side before upload
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-white/50">
              <span>• Max 100MB (IPFS)</span>
              <span>• Max 5GB (Cloud)</span>
              <span>• Unlimited (P2P)</span>
            </div>
          </div>

          <button 
            className="px-8 py-3 bg-samurai-red hover:bg-samurai-red-dark text-white font-bold rounded-lg transition-all duration-300 shadow-lg hover:shadow-samurai-red/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={uploading}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Encrypting & Uploading...
              </span>
            ) : (
              'Select Files'
            )}
          </button>
        </div>
      </label>
    </div>
  )
}
