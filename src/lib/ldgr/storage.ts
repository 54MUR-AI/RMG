import { supabase } from '../supabase'
import { encryptFile, decryptFile, generateEncryptionKey, legacyDecryptFile } from './encryption'

export type FileMetadata = {
  id: string
  user_id: string
  name: string
  size: number
  type: string
  storage_path: string
  folder_id: string | null
  created_at: string
}

/**
 * Uploads an encrypted file to Supabase Storage
 */
export async function uploadFile(file: File, userId: string, userEmail: string, folderId: string | null = null) {
  try {
    // Generate encryption key from user credentials
    const encryptionKey = generateEncryptionKey(userId, userEmail)
    
    // Encrypt the file
    const encryptedBlob = await encryptFile(file, encryptionKey)
    
    // Generate unique file path (simplified for testing)
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}.encrypted`
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(fileName, encryptedBlob, {
        contentType: 'application/octet-stream',
        upsert: false
      })
    
    if (uploadError) throw uploadError
    
    // Save metadata to database
    const { data: metadataData, error: metadataError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        name: file.name,
        size: file.size,
        type: file.type,
        storage_path: uploadData.path,
        folder_id: folderId
      })
      .select()
      .single()
    
    if (metadataError) throw metadataError
    
    return metadataData as FileMetadata
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

/**
 * Uploads a file encrypted with the folder's key (for shared folders).
 * Anyone with access to the folder can derive the same key and decrypt.
 * Falls back to user-keyed encryption if no folderId is provided.
 */
export async function uploadSharedFile(
  file: File,
  userId: string,
  _userEmail: string,
  folderId: string
) {
  try {
    // Encrypt with folder key so all folder members can decrypt
    const encryptionKey = folderId
    const encryptedBlob = await encryptFile(file, encryptionKey)
    
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}.encrypted`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('files')
      .upload(fileName, encryptedBlob, {
        contentType: 'application/octet-stream',
        upsert: false
      })
    
    if (uploadError) throw uploadError
    
    const { data: metadataData, error: metadataError } = await supabase
      .from('files')
      .insert({
        user_id: userId,
        name: file.name,
        size: file.size,
        type: file.type,
        storage_path: uploadData.path,
        folder_id: folderId
      })
      .select()
      .single()
    
    if (metadataError) throw metadataError
    
    return metadataData as FileMetadata
  } catch (error) {
    console.error('Shared upload error:', error)
    throw error
  }
}

/**
 * Downloads and decrypts a file from Supabase Storage.
 * Tries folder-keyed decryption first (for shared files), then user-keyed,
 * then legacy CryptoJS for old files.
 */
export async function downloadFile(
  fileMetadata: FileMetadata,
  userId: string,
  userEmail: string
) {
  try {
    // Download encrypted file from storage
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('files')
      .download(fileMetadata.storage_path)
    
    if (downloadError) throw downloadError
    
    let decryptedBlob: Blob

    // Try 1: Folder-keyed decryption (shared files)
    if (fileMetadata.folder_id) {
      try {
        decryptedBlob = await decryptFile(
          downloadData,
          fileMetadata.folder_id,
          fileMetadata.type
        )
        triggerDownload(decryptedBlob, fileMetadata.name)
        return
      } catch {
        // Not folder-keyed, try next
      }
    }

    // Try 2: User-keyed decryption (personal files)
    const encryptionKey = generateEncryptionKey(userId, userEmail)
    try {
      decryptedBlob = await decryptFile(
        downloadData,
        encryptionKey,
        fileMetadata.type
      )
      triggerDownload(decryptedBlob, fileMetadata.name)
      return
    } catch {
      // Not user-keyed, try legacy
    }

    // Try 3: Legacy CryptoJS decryption
    const legacyResult = await legacyDecryptFile(
      downloadData,
      userId,
      userEmail,
      fileMetadata.type
    )
    if (!legacyResult) {
      throw new Error('Failed to decrypt file with all available methods')
    }
    triggerDownload(legacyResult, fileMetadata.name)
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
}

/**
 * Helper to trigger a browser file download
 */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Fetches files for the current user in a specific folder (or root if folderId is null)
 */
export async function getUserFiles(userId: string, folderId: string | null = null): Promise<FileMetadata[]> {
  const query = supabase
    .from('files')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (folderId === null) {
    query.is('folder_id', null)
  } else {
    query.eq('folder_id', folderId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as FileMetadata[]
}

/**
 * Fetches files shared with the user via wspr_file_shares (for Drops folder view)
 */
export async function getSharedFiles(userId: string): Promise<Array<FileMetadata & { shared_by_display_name: string; share_context: string }>> {
  const { data, error } = await supabase
    .rpc('get_shared_files', { user_id_param: userId })

  if (error) {
    console.error('Error fetching shared files:', error)
    return []
  }

  return (data || []).map((item: any) => ({
    id: item.file_id,
    user_id: item.shared_by_user_id,
    name: item.filename,
    size: item.file_size,
    type: item.file_type,
    storage_path: item.storage_path,
    folder_id: null,
    created_at: item.shared_at,
    shared_by_display_name: item.shared_by_display_name,
    share_context: item.share_context
  }))
}

/**
 * Moves a file to a different folder
 */
export async function moveFile(fileId: string, newFolderId: string | null): Promise<FileMetadata> {
  const { data, error } = await supabase
    .from('files')
    .update({ folder_id: newFolderId })
    .eq('id', fileId)
    .select()
    .single()
  
  if (error) throw error
  return data as FileMetadata
}

/**
 * Deletes a file from storage and database
 */
export async function deleteFile(fileMetadata: FileMetadata) {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('files')
      .remove([fileMetadata.storage_path])
    
    if (storageError) throw storageError
    
    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileMetadata.id)
    
    if (dbError) throw dbError
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}
