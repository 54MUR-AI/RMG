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
    <>
      {/* Mobile: Compact Upload Button */}
      <div className="md:hidden">
        <input
          type="file"
          id="file-upload-mobile"
          className="hidden"
          onChange={handleFileInput}
          disabled={uploading}
        />
        <label 
          htmlFor="file-upload-mobile" 
          className={`
            flex items-center justify-center gap-3 w-full p-4 rounded-xl transition-all
            ${uploading 
              ? 'bg-samurai-grey-dark cursor-not-allowed opacity-50' 
              : 'bg-samurai-red hover:bg-samurai-red-dark cursor-pointer'
            }
          `}
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-bold text-white">Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 text-white" />
              <span className="font-bold text-white">Upload File</span>
              <Lock className="w-4 h-4 text-white/70" />
            </>
          )}
        </label>
      </div>

      {/* Desktop: Full Drag & Drop Area */}
      <div
        className={`
          hidden md:block
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
              <Upload className="w-16 h-16 text-samurai-red" />
              <Lock className="w-8 h-8 text-white absolute -bottom-2 -right-2" />
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

            {uploading && (
              <div className="flex items-center gap-2 text-samurai-red font-bold">
                <div className="w-5 h-5 border-2 border-samurai-red/30 border-t-samurai-red rounded-full animate-spin" />
                Encrypting & Uploading...
              </div>
            )}
          </div>
        </label>
      </div>
    </>
  )
}
