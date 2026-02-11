import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Loader2, Lock, BookOpen, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ReadmePopup from '../components/ReadmePopup'

export default function WsprPage() {
  const { user } = useAuth()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReadme, setShowReadme] = useState(false)

  useEffect(() => {
    // Only check health if user is authenticated
    if (!user) return

    // Check if WSPR backend is healthy
    const checkHealth = async () => {
      try {
        const response = await fetch('https://wspr-backend.onrender.com/api/health')
        if (response.ok) {
          setIsLoading(false)
        } else {
          setError('WSPR service is currently unavailable')
          setIsLoading(false)
        }
      } catch (err) {
        // Service might be spinning up on Render free tier
        setIsLoading(false)
      }
    }

    checkHealth()

    // Send Supabase auth token to WSPR iframe
    const sendAuthToken = () => {
      if (!iframeRef.current?.contentWindow) return

      // Get Supabase auth token from localStorage
      const possibleKeys = [
        'sb-meqfiyuaxgwbstcdmjgz-auth-token',
        'supabase.auth.token',
        'sb-auth-token'
      ]

      let authToken = null
      for (const key of possibleKeys) {
        const data = localStorage.getItem(key)
        if (data) {
          try {
            const parsed = JSON.parse(data)
            if (parsed.access_token || parsed.token) {
              authToken = data
              break
            }
          } catch (e) {
            continue
          }
        }
      }

      if (authToken) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'RMG_AUTH_TOKEN',
            authToken: authToken
          },
          'https://wspr-web.onrender.com'
        )
      }
    }

    // Listen for auth requests from WSPR iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'WSPR_REQUEST_AUTH') {
        sendAuthToken()
      }
    }

    window.addEventListener('message', handleMessage)

    // Send auth token when iframe loads
    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', sendAuthToken)
    }

    return () => {
      window.removeEventListener('message', handleMessage)
      if (iframe) {
        iframe.removeEventListener('load', sendAuthToken)
      }
    }
  }, [user])

  // Handle LDGR folder creation from WSPR
  useEffect(() => {
    const handleWsprMessage = async (event: MessageEvent) => {
      // Only accept messages from WSPR
      if (!event.origin.includes('wspr-web.onrender.com') && !event.origin.includes('localhost')) {
        return
      }

      if (event.data.type === 'WSPR_CREATE_LDGR_FOLDER') {
        console.log('RMG: Received LDGR folder creation request:', event.data)
        
        try {
          const { createWorkspaceFolder, linkWorkspaceToFolder } = await import('../lib/wspr/ldgrIntegration')
          
          // Create folder in LDGR
          const folderId = await createWorkspaceFolder(
            event.data.workspaceName,
            event.data.ownerId
          )
          
          // Link workspace to folder
          await linkWorkspaceToFolder(event.data.workspaceId, folderId)
          
          // Send success response back to WSPR
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'LDGR_FOLDER_CREATED',
              workspaceId: event.data.workspaceId,
              folderId: folderId
            }, '*')
          }
          
          console.log('✅ LDGR folder created and linked:', folderId)
        } catch (error) {
          console.error('❌ Failed to create LDGR folder:', error)
          
          // Send error response back to WSPR
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'LDGR_FOLDER_ERROR',
              workspaceId: event.data.workspaceId,
              error: error instanceof Error ? error.message : 'Unknown error'
            }, '*')
          }
        }
      } else if (event.data.type === 'WSPR_CREATE_CHANNEL_FOLDER') {
        console.log('RMG: Received channel folder creation request:', event.data)
        
        try {
          const { createChannelFolder, linkChannelToFolder } = await import('../lib/wspr/ldgrIntegration')
          
          // Create subfolder in workspace folder
          const folderId = await createChannelFolder(
            event.data.channelName,
            event.data.workspaceFolderId,
            event.data.ownerId
          )
          
          // Link channel to folder
          await linkChannelToFolder(event.data.channelId, folderId)
          
          // Send success response back to WSPR
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'LDGR_CHANNEL_FOLDER_CREATED',
              channelId: event.data.channelId,
              folderId: folderId
            }, '*')
          }
          
          console.log('✅ LDGR channel folder created and linked:', folderId)
        } catch (error) {
          console.error('❌ Failed to create channel folder:', error)
        }
      } else if (event.data.type === 'WSPR_DELETE_LDGR_FOLDER') {
        console.log('RMG: Received LDGR folder deletion request:', event.data)
        
        try {
          const { deleteFolder } = await import('../lib/ldgr/folders')
          
          // Delete folder (cascades to subfolders and files)
          await deleteFolder(event.data.folderId)
          
          console.log('✅ LDGR folder deleted:', event.data.folderId)
        } catch (error) {
          console.error('❌ Failed to delete LDGR folder:', error)
        }
      } else if (event.data.type === 'WSPR_UPLOAD_FILE') {
        console.log('RMG: Received file upload request:', event.data)
        
        // TODO: Implement file upload to LDGR
        // This will need to:
        // 1. Open file picker or receive file data
        // 2. Upload to LDGR
        // 3. Return file ID to WSPR
        
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'LDGR_FILE_UPLOAD_ERROR',
            error: 'File upload not yet implemented'
          }, '*')
        }
      } else if (event.data.type === 'WSPR_BROWSE_LDGR') {
        console.log('RMG: Received LDGR browse request:', event.data)
        
        // TODO: Implement LDGR file browser
        // This will need to:
        // 1. Open LDGR file browser modal
        // 2. Let user select a file
        // 3. Return file metadata to WSPR
        
        if (iframeRef.current?.contentWindow) {
          iframeRef.current.contentWindow.postMessage({
            type: 'LDGR_FILE_SELECTED',
            fileId: 'placeholder-file-id',
            filename: 'placeholder.txt',
            fileSize: 1024,
            mimeType: 'text/plain'
          }, '*')
        }
      } else if (event.data.type === 'WSPR_DOWNLOAD_FILE') {
        console.log('RMG: Received file download request:', event.data)
        
        // TODO: Implement file download from LDGR
        // This will need to:
        // 1. Fetch file from LDGR by ID
        // 2. Trigger browser download
        
        try {
          const { downloadFile } = await import('../lib/ldgr/files')
          await downloadFile(event.data.fileId, event.data.filename)
          console.log('✅ File download initiated:', event.data.filename)
        } catch (error) {
          console.error('❌ Failed to download file:', error)
        }
      }
    }

    window.addEventListener('message', handleWsprMessage)
    return () => window.removeEventListener('message', handleWsprMessage)
  }, [])

  // Send settings toggle to iframe
  const handleSettingsClick = () => {
    console.log('RMG: Settings button clicked')
    if (iframeRef.current?.contentWindow) {
      console.log('RMG: Sending RMG_TOGGLE_SETTINGS to WSPR iframe')
      iframeRef.current.contentWindow.postMessage(
        { type: 'RMG_TOGGLE_SETTINGS' },
        '*' // Use wildcard for development, change to specific origin in production
      )
    } else {
      console.error('RMG: iframe contentWindow not available')
    }
  }

  // Auth gate - require login
  if (!user) {
    return (
      <div className="min-h-screen bg-samurai-black flex items-center justify-center p-4">
        <div className="glass-card p-12 rounded-xl max-w-md text-center">
          <Lock className="w-20 h-20 text-samurai-red mx-auto mb-6 animate-glow-pulse" />
          <h1 className="text-4xl font-bold neon-text mb-4">WSPR</h1>
          <p className="text-xl text-samurai-steel mb-6">Web Secure P2P Relay</p>
          <p className="text-samurai-steel-light mb-8">
            WSPR is a secure, encrypted messaging platform exclusively for RMG members.
          </p>
          <div className="bg-samurai-black-lighter border border-samurai-red/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-samurai-steel">
              🔒 End-to-end encryption<br/>
              🛡️ Quantum-resistant security<br/>
              📁 LDGR file integration<br/>
              🎥 Video/voice calls
            </p>
          </div>
          <p className="text-samurai-red font-semibold">
            Please sign in to access WSPR
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-samurai-black">
      {/* Header */}
      <div className="bg-samurai-black-light border-b border-samurai-grey-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-samurai-red" />
            <div>
              <h1 className="text-2xl font-bold neon-text">WSPR</h1>
              <p className="text-sm text-samurai-steel">Web Secure P2P Relay</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-samurai-red animate-spin mx-auto mb-4" />
            <p className="text-samurai-steel">Connecting to WSPR...</p>
            <p className="text-xs text-samurai-steel-dark mt-2">
              (Free tier services may take 30-60s to spin up)
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="glass-card p-8 rounded-xl max-w-md text-center">
            <MessageSquare className="w-16 h-16 text-samurai-red mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Service Unavailable</h2>
            <p className="text-samurai-steel mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Retry Connection
            </button>
          </div>
        </div>
      )}

      {/* WSPR Iframe */}
      {!isLoading && !error && user && (
        <div className="h-[calc(100vh-200px)]">
          <iframe
            key={Date.now()}
            ref={iframeRef}
            src={(() => {
              const username = user.user_metadata?.display_name || user.email?.split('@')[0] || ''
              console.log('RMG: Passing to WSPR - userId:', user.id, 'email:', user.email, 'username:', username, 'user_metadata:', user.user_metadata)
              return `https://wspr-web.onrender.com?userId=${user.id}&email=${encodeURIComponent(user.email || '')}&username=${encodeURIComponent(username)}&v=${Date.now()}`
            })()}
            className="w-full h-full border-0"
            title="WSPR - Web Secure P2P Relay"
            allow="camera; microphone; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        </div>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-20 left-6 flex flex-col gap-3 z-50">
        {/* README Button */}
        <button
          onClick={() => setShowReadme(true)}
          className="p-4 bg-samurai-grey-dark text-white rounded-full shadow-lg hover:bg-samurai-red transition-all hover:scale-110"
          aria-label="README"
        >
          <BookOpen className="w-6 h-6" />
        </button>
        
        {/* Settings Button */}
        <button
          onClick={handleSettingsClick}
          className="p-4 bg-samurai-red text-white rounded-full shadow-lg shadow-samurai-red/50 hover:bg-samurai-red-dark transition-all hover:scale-110"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {/* README Popup */}
      {showReadme && (
        <ReadmePopup
          readmeUrl="https://raw.githubusercontent.com/54MUR-AI/wspr-web/main/README.md"
          onClose={() => setShowReadme(false)}
        />
      )}
    </div>
  )
}
