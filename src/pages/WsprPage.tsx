import { useState, useEffect, useRef, useMemo } from 'react'
import { MessageSquare, Loader2, Lock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import ReadmePopup from '../components/ReadmePopup'
import LdgrFileBrowserModal from '../components/LdgrFileBrowserModal'
import { supabase } from '../lib/supabase'

export default function WsprPage() {
  const { user } = useAuth()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReadme, setShowReadme] = useState(false)
  const [showFileBrowser, setShowFileBrowser] = useState(false)

  // Memoize iframe URL so it doesn't change on unrelated re-renders (e.g. README modal)
  const wsprUrl = useMemo(() => {
    if (!user) return ''
    const username = user.user_metadata?.display_name || user.email?.split('@')[0] || ''
    return `https://wspr-rmg.onrender.com?userId=${user.id}&email=${encodeURIComponent(user.email || '')}&username=${encodeURIComponent(username)}`
  }, [user?.id, user?.email, user?.user_metadata?.display_name])

  useEffect(() => {
    // Only check health if user is authenticated
    if (!user) return

    // Check if WSPR backend is healthy
    const checkHealth = async () => {
      try {
        const response = await fetch('https://wspr-api.onrender.com/api/health')
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
    const sendAuthToken = async () => {
      if (!iframeRef.current?.contentWindow) return

      // Get current session from Supabase client (not localStorage)
      // This ensures we always pass the currently logged-in user's token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        const authToken = JSON.stringify({
          access_token: session.access_token,
          refresh_token: session.refresh_token
        })
        
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'RMG_AUTH_TOKEN',
            authToken: authToken
          },
          'https://wspr-rmg.onrender.com'
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
      if (!event.origin.includes('wspr-rmg.onrender.com') && !event.origin.includes('localhost')) {
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

          // Grant folder_access to all workspace members for this channel folder
          const { data: channel } = await supabase
            .from('wspr_channels')
            .select('workspace_id')
            .eq('id', event.data.channelId)
            .single()

          if (channel?.workspace_id) {
            const { data: members } = await supabase
              .from('wspr_workspace_members')
              .select('user_id, role')
              .eq('workspace_id', channel.workspace_id)

            if (members) {
              for (const member of members) {
                const accessLevel = member.role === 'owner' || member.role === 'admin' ? 'write' : 'read'
                await supabase
                  .from('folder_access')
                  .upsert({
                    folder_id: folderId,
                    user_id: member.user_id,
                    access_level: accessLevel
                  }, { onConflict: 'folder_id,user_id' })
              }
              console.log(`✅ Granted folder_access to ${members.length} workspace members`)
            }
          }
          
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
        
        if (user && event.data.fileData) {
          try {
            // Convert base64 data URL to File object
            const base64Data = event.data.fileData
            const response = await fetch(base64Data)
            const blob = await response.blob()
            const file = new File([blob], event.data.fileName, { type: event.data.fileType })
            
            // Get channel's LDGR folder ID from event data
            const channelFolderId = event.data.channelFolderId
            
            // Upload file to LDGR — use folder-keyed encryption for channel files
            const { uploadFile, uploadSharedFile } = await import('../lib/ldgr/storage')
            const fileMetadata = channelFolderId
              ? await uploadSharedFile(file, user.id, user.email!, channelFolderId)
              : await uploadFile(file, user.id, user.email!)
            
            // Send success response back to WSPR
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                type: 'LDGR_FILE_UPLOADED',
                fileId: fileMetadata.id,
                filename: fileMetadata.name,
                fileSize: fileMetadata.size,
                mimeType: fileMetadata.type
              }, '*')
            }
            
            console.log('✅ File uploaded to LDGR:', fileMetadata)
          } catch (error) {
            console.error('❌ File upload failed:', error)
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                type: 'LDGR_FILE_UPLOAD_ERROR',
                error: error instanceof Error ? error.message : 'Upload failed'
              }, '*')
            }
          }
        }
      } else if (event.data.type === 'WSPR_GRANT_FILE_ACCESS') {
        console.log('RMG: Received file access grant request:', event.data)
        
        try {
          // Look up the file's folder
          const { data: file } = await supabase
            .from('files')
            .select('folder_id')
            .eq('id', event.data.fileId)
            .single()

          if (file?.folder_id) {
            // Grant read access to the recipient for this folder
            await supabase
              .from('folder_access')
              .upsert({
                folder_id: file.folder_id,
                user_id: event.data.recipientId,
                access_level: 'read',
                granted_by: user?.id
              }, { onConflict: 'folder_id,user_id' })

            console.log('✅ Granted folder_access to recipient:', event.data.recipientId)
          }
        } catch (error) {
          console.error('❌ Failed to grant file access:', error)
        }
      } else if (event.data.type === 'WSPR_BROWSE_LDGR') {
        console.log('RMG: Received LDGR browse request:', event.data)
        
        // Open LDGR file browser modal
        setShowFileBrowser(true)
      } else if (event.data.type === 'WSPR_DOWNLOAD_FILE') {
        console.log('RMG: Received file download request:', event.data)
        
        if (user) {
          try {
            // Fetch file metadata from LDGR
            const { data: fileMetadata, error } = await supabase
              .from('files')
              .select('*')
              .eq('id', event.data.fileId)
              .single()
            
            if (error || !fileMetadata) {
              throw new Error('File not found')
            }
            
            // Download file — use file owner's userId for decryption
            // (user-keyed files are encrypted with the uploader's userId)
            const { downloadFile } = await import('../lib/ldgr/storage')
            await downloadFile(fileMetadata, fileMetadata.user_id, user.email!)
            
            console.log('✅ File download initiated:', event.data.filename)
          } catch (error) {
            console.error('❌ Failed to download file:', error)
            alert('Failed to download file: ' + (error instanceof Error ? error.message : 'Unknown error'))
          }
        }
      }
    }

    window.addEventListener('message', handleWsprMessage)
    return () => window.removeEventListener('message', handleWsprMessage)
  }, [user])

  // Listen for footer button events
  useEffect(() => {
    const onReadme = () => setShowReadme(true)
    const onSettings = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage({ type: 'RMG_TOGGLE_SETTINGS' }, '*')
      }
    }
    window.addEventListener('rmg:readme', onReadme)
    window.addEventListener('rmg:settings', onSettings)
    return () => {
      window.removeEventListener('rmg:readme', onReadme)
      window.removeEventListener('rmg:settings', onSettings)
    }
  }, [])


  // Auth gate - require login
  if (!user) {
    return (
      <div className="bg-samurai-black flex items-center justify-center p-4 py-32">
        <div className="text-center">
          <Lock className="w-16 h-16 text-samurai-red mx-auto mb-4" />
          <h1 className="text-3xl font-black text-white mb-2 neon-text">WSPR</h1>
          <p className="text-white/70 mb-6">Please sign in to access WSPR</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full bg-samurai-black">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-screen">
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
        <div className="flex items-center justify-center min-h-screen">
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
        <div className="h-full">
          <iframe
            key={user.id}
            ref={iframeRef}
            src={wsprUrl}
            className="w-full h-full border-0"
            title="WSPR - Web Secure P2P Relay"
            allow="camera; microphone; clipboard-write"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          />
        </div>
      )}

      {/* README Popup */}
      {showReadme && (
        <ReadmePopup
          readmeUrl="https://raw.githubusercontent.com/54MUR-AI/wspr-web/main/README.md"
          onClose={() => setShowReadme(false)}
        />
      )}

      {/* LDGR File Browser Modal */}
      {showFileBrowser && user && (
        <LdgrFileBrowserModal
          isOpen={showFileBrowser}
          onClose={() => {
            setShowFileBrowser(false)
            // Send cancel message to WSPR
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                type: 'LDGR_BROWSE_CANCELLED'
              }, '*')
            }
          }}
          onSelectFile={(file) => {
            // Send selected file metadata to WSPR
            if (iframeRef.current?.contentWindow) {
              iframeRef.current.contentWindow.postMessage({
                type: 'LDGR_FILE_SELECTED',
                fileId: file.id,
                filename: file.name,
                fileSize: file.size,
                mimeType: file.type
              }, '*')
            }
            setShowFileBrowser(false)
          }}
          userId={user.id}
        />
      )}
    </div>
  )
}
