import { supabase } from '../supabase'

export interface Folder {
  id: string
  user_id: string
  name: string
  parent_id: string | null
  display_order: number
  created_at: string
  updated_at: string
}

/**
 * Get all folders for the current user (owned + shared)
 */
export async function getUserFolders(userId: string): Promise<Folder[]> {
  // Get owned folders
  const { data: ownedFolders, error: ownedError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })
  
  if (ownedError) throw ownedError

  // Get shared folder IDs
  const { data: sharedAccess, error: sharedError } = await supabase
    .from('folder_access')
    .select('folder_id')
    .eq('user_id', userId)

  if (sharedError) throw sharedError

  // Get shared folders
  if (sharedAccess && sharedAccess.length > 0) {
    const sharedFolderIds = sharedAccess.map(a => a.folder_id)
    const { data: sharedFolders, error: sharedFoldersError } = await supabase
      .from('folders')
      .select('*')
      .in('id', sharedFolderIds)
      .order('name', { ascending: true })

    if (sharedFoldersError) throw sharedFoldersError

    // Combine and deduplicate
    const allFolders = [...(ownedFolders || []), ...(sharedFolders || [])]
    const uniqueFolders = Array.from(new Map(allFolders.map(f => [f.id, f])).values())
    return uniqueFolders.sort((a, b) => a.name.localeCompare(b.name))
  }

  return ownedFolders as Folder[]
}

/**
 * Get folders in a specific parent folder (or root if parentId is null)
 * Includes both owned folders and shared folders
 */
export async function getFoldersByParent(userId: string, parentId: string | null): Promise<Folder[]> {
  // Get owned folders
  const ownedQuery = supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .order('display_order', { ascending: true })
  
  if (parentId === null) {
    ownedQuery.is('parent_id', null)
  } else {
    ownedQuery.eq('parent_id', parentId)
  }
  
  const { data: ownedFolders, error: ownedError } = await ownedQuery
  
  if (ownedError) throw ownedError
  
  // If at root level, also get shared folders
  if (parentId === null) {
    const { data: sharedAccess } = await supabase
      .from('folder_access')
      .select('folder_id')
      .eq('user_id', userId)
    
    if (sharedAccess && sharedAccess.length > 0) {
      const sharedFolderIds = sharedAccess.map(a => a.folder_id)
      const { data: sharedFolders } = await supabase
        .from('folders')
        .select('*')
        .in('id', sharedFolderIds)
        .is('parent_id', null) // Only root-level shared folders
        .order('display_order', { ascending: true })
      
      if (sharedFolders && sharedFolders.length > 0) {
        // Combine and deduplicate
        const allFolders = [...(ownedFolders || []), ...sharedFolders]
        const uniqueFolders = Array.from(new Map(allFolders.map(f => [f.id, f])).values())
        return uniqueFolders.sort((a, b) => a.display_order - b.display_order)
      }
    }
  }
  
  return ownedFolders as Folder[]
}

/**
 * Create a new folder
 */
export async function createFolder(
  userId: string,
  name: string,
  parentId: string | null = null
): Promise<Folder> {
  // Get max display_order for folders in same parent
  const { data: siblings } = await supabase
    .from('folders')
    .select('display_order')
    .eq('user_id', userId)
    .is('parent_id', parentId)
    .order('display_order', { ascending: false })
    .limit(1)
  
  const maxOrder = siblings && siblings.length > 0 ? siblings[0].display_order : -1
  
  const { data, error } = await supabase
    .from('folders')
    .insert({
      user_id: userId,
      name,
      parent_id: parentId,
      display_order: maxOrder + 1
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
  // Check if this folder is linked to a WSPR workspace
  const { data: workspace } = await supabase
    .from('wspr_workspaces')
    .select('id, name')
    .eq('ldgr_folder_id', folderId)
    .single()

  if (workspace) {
    throw new Error(`Cannot delete folder: it is linked to WSPR workspace "${workspace.name}". Delete the workspace instead.`)
  }

  // Check if this folder is linked to a WSPR channel
  const { data: channel } = await supabase
    .from('wspr_channels')
    .select('id, name')
    .eq('ldgr_folder_id', folderId)
    .single()

  if (channel) {
    throw new Error(`Cannot delete folder: it is linked to WSPR channel "${channel.name}". Delete the channel instead.`)
  }

  // Proceed with deletion if not linked to WSPR
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
    const { data, error }: { data: Folder | null; error: any } = await supabase
      .from('folders')
      .select('*')
      .eq('id', currentId)
      .single()
    
    if (error || !data) break
    
    path.unshift(data)
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

/**
 * Update folder display order
 */
export async function updateFolderOrder(folderId: string, newOrder: number): Promise<Folder> {
  const { data, error } = await supabase
    .from('folders')
    .update({ display_order: newOrder })
    .eq('id', folderId)
    .select()
    .single()
  
  if (error) throw error
  return data as Folder
}

/**
 * Reorder folders after drag and drop
 */
export async function reorderFolders(folders: Folder[]): Promise<void> {
  // Update all folders with their new order
  const updates = folders.map((folder, index) => 
    supabase
      .from('folders')
      .update({ display_order: index })
      .eq('id', folder.id)
  )
  
  await Promise.all(updates)
}

/**
 * Ensure default folders exist for user
 * NOTE: Folders are now created automatically by database trigger (handle_new_user)
 * This function is kept for backwards compatibility but does nothing
 * @deprecated Folders are created by database trigger
 */
export async function ensureDefaultFolders(_userId: string): Promise<void> {
  // Folders are now created by database trigger on user signup
  // No action needed here - userId parameter kept for backwards compatibility
  return Promise.resolve()
}

/**
 * Ensure default "Scrapes" folder exists for user
 * Creates it if it doesn't exist, returns the folder either way
 */
export async function ensureScrapesFolder(userId: string): Promise<Folder> {
  // Check if Scrapes folder already exists
  const { data: existing, error: fetchError } = await supabase
    .from('folders')
    .select('*')
    .eq('user_id', userId)
    .eq('name', 'Scrapes')
    .is('parent_id', null)
    .maybeSingle()
  
  if (fetchError) throw fetchError
  
  // If it exists, return it
  if (existing) {
    return existing as Folder
  }
  
  // Otherwise, create it
  return await createFolder(userId, 'Scrapes', null)
}
