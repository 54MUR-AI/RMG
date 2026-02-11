import { supabase } from '../supabase'

export interface FolderAccess {
  id: string
  folder_id: string
  user_id: string
  access_level: 'read' | 'write' | 'admin'
  granted_by: string | null
  created_at: string
  updated_at: string
}

/**
 * Grant user access to a folder
 */
export async function grantFolderAccess(
  folderId: string,
  userId: string,
  accessLevel: 'read' | 'write' | 'admin' = 'write',
  grantedBy?: string
): Promise<FolderAccess> {
  const { data, error } = await supabase
    .from('folder_access')
    .insert({
      folder_id: folderId,
      user_id: userId,
      access_level: accessLevel,
      granted_by: grantedBy || null
    })
    .select()
    .single()

  if (error) throw error
  return data as FolderAccess
}

/**
 * Revoke user access to a folder
 */
export async function revokeFolderAccess(
  folderId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('folder_access')
    .delete()
    .eq('folder_id', folderId)
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Get all users with access to a folder
 */
export async function getFolderAccessList(
  folderId: string
): Promise<FolderAccess[]> {
  const { data, error } = await supabase
    .from('folder_access')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as FolderAccess[]
}

/**
 * Get all folders a user has access to (not owned by them)
 */
export async function getUserSharedFolders(
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('folder_access')
    .select('folder_id')
    .eq('user_id', userId)

  if (error) throw error
  return (data || []).map(item => item.folder_id)
}

/**
 * Update user's access level to a folder
 */
export async function updateFolderAccess(
  folderId: string,
  userId: string,
  accessLevel: 'read' | 'write' | 'admin'
): Promise<FolderAccess> {
  const { data, error } = await supabase
    .from('folder_access')
    .update({ access_level: accessLevel })
    .eq('folder_id', folderId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data as FolderAccess
}

/**
 * Check if user has access to a folder
 */
export async function checkFolderAccess(
  folderId: string,
  userId: string
): Promise<FolderAccess | null> {
  const { data, error } = await supabase
    .from('folder_access')
    .select('*')
    .eq('folder_id', folderId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data as FolderAccess | null
}

/**
 * Grant access to all workspace members for a folder
 */
export async function syncWorkspaceFolderAccess(
  workspaceId: string,
  folderId: string,
  ownerId: string
): Promise<void> {
  // Get all workspace members except owner
  const { data: members, error: membersError } = await supabase
    .from('wspr_workspace_members')
    .select('user_id')
    .eq('workspace_id', workspaceId)
    .neq('user_id', ownerId)

  if (membersError) throw membersError

  // Grant access to each member
  const accessPromises = (members || []).map(member =>
    grantFolderAccess(folderId, member.user_id, 'write', ownerId)
      .catch(err => {
        // Ignore duplicate errors (user already has access)
        if (!err.message?.includes('duplicate')) {
          console.error(`Failed to grant access to ${member.user_id}:`, err)
        }
      })
  )

  await Promise.all(accessPromises)
}

/**
 * Revoke access for all workspace members from a folder
 */
export async function revokeWorkspaceFolderAccess(
  workspaceId: string,
  folderId: string
): Promise<void> {
  // Get all workspace members
  const { data: members, error: membersError } = await supabase
    .from('wspr_workspace_members')
    .select('user_id')
    .eq('workspace_id', workspaceId)

  if (membersError) throw membersError

  // Revoke access from each member
  const revokePromises = (members || []).map(member =>
    revokeFolderAccess(folderId, member.user_id)
      .catch(err => console.error(`Failed to revoke access from ${member.user_id}:`, err))
  )

  await Promise.all(revokePromises)
}
