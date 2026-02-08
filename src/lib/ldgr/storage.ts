import { supabase } from './supabase'
import { encryptFile, decryptFile, generateEncryptionKey } from './encryption'

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
 * Downloads and decrypts a file from Supabase Storage
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
    
    // Generate decryption key
    const encryptionKey = generateEncryptionKey(userId, userEmail)
    
    // Decrypt the file
    const decryptedBlob = await decryptFile(
      downloadData,
      encryptionKey,
      fileMetadata.type
    )
    
    // Trigger download
    const url = URL.createObjectURL(decryptedBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileMetadata.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Download error:', error)
    throw error
  }
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
