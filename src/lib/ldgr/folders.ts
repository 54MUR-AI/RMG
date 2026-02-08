import { supabase } from './supabase'

export interface Folder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

/**
 * Get all folders for the current user
 */
export async function getUserFolders(userId: string): Promise<Folder[]> {
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  
  if (error) throw error
  return data as Folder[]
}

/**
 * Get folders in a specific parent folder (or root if parentId is null)
 */
export async function getFoldersByParent(userId: string, parentId: string | null): Promise<Folder[]> {
  const query = supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  
  if (parentId === null) {
    query.is('parent_id', null)
  } else {
    query.eq('parent_id', parentId)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data as Folder[]
}

/**
 * Create a new folder
 */
export async function createFolder(
  userId: string,
  name: string,
  parentId: string | null = null
): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: userId,
      name,
      parent_id: parentId
    })
    .select()
    .single()
  
  if (error) throw error
  return data as Folder
}

/**
 * Rename a folder
 */
export async function renameFolder(folderId: string, newName: string): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .update({ name: newName })
    .eq('id', folderId)
    .select()
    .single()
  
  if (error) throw error
  return data as Folder
}

/**
 * Delete a folder (and all its contents)
 */
export async function deleteFolder(folderId: string): Promise<void> {
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', folderId)
  
  if (error) throw error
}

/**
 * Move a folder to a new parent
 */
export async function moveFolder(folderId: string, newParentId: string | null): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .update({ parent_id: newParentId })
    .eq('id', folderId)
    .select()
    .single()
  
  if (error) throw error
  return data as Folder
}

/**
 * Get folder path (breadcrumb trail)
 */
export async function getFolderPath(folderId: string | null): Promise<Folder[]> {
  if (!folderId) return []
  
  const path: Folder[] = []
  let currentId: string | null = folderId
  
  while (currentId) {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('id', currentId)
      .single()
    
    if (error || !data) break
    
    path.unshift(data as Folder)
    currentId = data.parent_id
  }
  
  return path
}

/**
 * Count files in a folder
 */
export async function countFilesInFolder(folderId: string | null): Promise<number> {
  const query = supabase
    .from('files')
    .select('id', { count: 'exact', head: true })
  
  if (folderId === null) {
    query.is('folder_id', null)
  } else {
    query.eq('folder_id', folderId)
  }
  
  const { count, error } = await query
  
  if (error) throw error
  return count || 0
}
