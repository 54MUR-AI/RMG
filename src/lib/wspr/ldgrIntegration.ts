import { supabase } from '../supabase'
import { createFolder } from '../ldgr/folders'
import { grantFolderAccess, syncWorkspaceFolderAccess, revokeFolderAccess } from '../ldgr/folderAccess'

/**
 * Create LDGR folder for a workspace
 * Returns the folder ID
 */
export async function createWorkspaceFolder(
  workspaceName: string,
  ownerId: string
): Promise<string> {
  try {
    // Create folder in LDGR with workspace name
    const folder = await createFolder(ownerId, workspaceName, null)
    
    console.log(`📁 Created LDGR folder for workspace "${workspaceName}": ${folder.id}`)
    
    return folder.id
  } catch (error) {
    console.error('Error creating workspace folder:', error)
    throw error
  }
}

/**
 * Create LDGR subfolder for a channel
 * Returns the folder ID
 */
export async function createChannelFolder(
  channelName: string,
  workspaceFolderId: string,
  ownerId: string
): Promise<string> {
  try {
    // Create subfolder in workspace folder
    const folder = await createFolder(ownerId, channelName, workspaceFolderId)
    
    console.log(`📁 Created LDGR subfolder for channel "${channelName}": ${folder.id}`)
    
    return folder.id
  } catch (error) {
    console.error('Error creating channel folder:', error)
    throw error
  }
}

/**
 * Link workspace to LDGR folder
 */
export async function linkWorkspaceToFolder(
  workspaceId: string,
  folderId: string
): Promise<void> {
  const { error } = await supabase
    .from('wspr_workspaces')
    .update({ ldgr_folder_id: folderId })
    .eq('id', workspaceId)

  if (error) throw error
}

/**
 * Link channel to LDGR folder
 */
export async function linkChannelToFolder(
  channelId: string,
  folderId: string
): Promise<void> {
  const { error } = await supabase
    .from('wspr_channels')
    .update({ ldgr_folder_id: folderId })
    .eq('id', channelId)

  if (error) throw error
}

/**
 * Grant workspace member access to workspace folder and all channel subfolders
 */
export async function grantWorkspaceMemberAccess(
  workspaceId: string,
  userId: string,
  grantedBy: string
): Promise<void> {
  try {
    // Get workspace folder
    const { data: workspace, error: workspaceError } = await supabase
      .from('wspr_workspaces')
      .select('ldgr_folder_id')
      .eq('id', workspaceId)
      .single()

    if (workspaceError) throw workspaceError
    if (!workspace?.ldgr_folder_id) {
      console.warn(`Workspace ${workspaceId} has no linked LDGR folder`)
      return
    }

    // Grant access to workspace folder
    await grantFolderAccess(workspace.ldgr_folder_id, userId, 'write', grantedBy)

    // Get all channel folders
    const { data: channels, error: channelsError } = await supabase
      .from('wspr_channels')
      .select('ldgr_folder_id')
      .eq('workspace_id', workspaceId)
      .not('ldgr_folder_id', 'is', null)

    if (channelsError) throw channelsError

    // Grant access to all channel folders
    const accessPromises = (channels || []).map(channel =>
      grantFolderAccess(channel.ldgr_folder_id!, userId, 'write', grantedBy)
        .catch(err => {
          if (!err.message?.includes('duplicate')) {
            console.error(`Failed to grant channel folder access:`, err)
          }
        })
    )

    await Promise.all(accessPromises)

    console.log(`✅ Granted LDGR access to user ${userId} for workspace ${workspaceId}`)
  } catch (error) {
    console.error('Error granting workspace member access:', error)
    throw error
  }
}

/**
 * Revoke workspace member access from workspace folder and all channel subfolders
 */
export async function revokeWorkspaceMemberAccess(
  workspaceId: string,
  userId: string
): Promise<void> {
  try {
    // Get workspace folder
    const { data: workspace, error: workspaceError } = await supabase
      .from('wspr_workspaces')
      .select('ldgr_folder_id')
      .eq('id', workspaceId)
      .single()

    if (workspaceError) throw workspaceError
    if (!workspace?.ldgr_folder_id) {
      console.warn(`Workspace ${workspaceId} has no linked LDGR folder`)
      return
    }

    // Revoke access from workspace folder
    await revokeFolderAccess(workspace.ldgr_folder_id, userId)

    // Get all channel folders
    const { data: channels, error: channelsError } = await supabase
      .from('wspr_channels')
      .select('ldgr_folder_id')
      .eq('workspace_id', workspaceId)
      .not('ldgr_folder_id', 'is', null)

    if (channelsError) throw channelsError

    // Revoke access from all channel folders
    const revokePromises = (channels || []).map(channel =>
      revokeFolderAccess(channel.ldgr_folder_id!, userId)
        .catch(err => console.error(`Failed to revoke channel folder access:`, err))
    )

    await Promise.all(revokePromises)

    console.log(`✅ Revoked LDGR access from user ${userId} for workspace ${workspaceId}`)
  } catch (error) {
    console.error('Error revoking workspace member access:', error)
    throw error
  }
}

/**
 * Sync all workspace members' access to workspace folders
 * Useful for fixing access after manual changes
 */
export async function syncAllWorkspaceMemberAccess(
  workspaceId: string
): Promise<void> {
  try {
    const { data: workspace, error: workspaceError } = await supabase
      .from('wspr_workspaces')
      .select('ldgr_folder_id, owner_id')
      .eq('id', workspaceId)
      .single()

    if (workspaceError) throw workspaceError
    if (!workspace?.ldgr_folder_id) {
      console.warn(`Workspace ${workspaceId} has no linked LDGR folder`)
      return
    }

    await syncWorkspaceFolderAccess(workspaceId, workspace.ldgr_folder_id, workspace.owner_id)

    console.log(`✅ Synced all member access for workspace ${workspaceId}`)
  } catch (error) {
    console.error('Error syncing workspace member access:', error)
    throw error
  }
}
