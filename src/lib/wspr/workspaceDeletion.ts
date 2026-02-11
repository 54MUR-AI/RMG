import { supabase } from '../supabase'
import { deleteFolder } from '../ldgr/folders'

/**
 * Delete workspace and its LDGR folder (cascades to channels and subfolders)
 */
export async function deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
  try {
    // Get workspace with folder info
    const { data: workspace, error: workspaceError } = await supabase
      .from('wspr_workspaces')
      .select('ldgr_folder_id, owner_id')
      .eq('id', workspaceId)
      .single()

    if (workspaceError) throw workspaceError
    if (!workspace) throw new Error('Workspace not found')
    
    // Verify user is owner
    if (workspace.owner_id !== userId) {
      throw new Error('Only workspace owner can delete workspace')
    }

    // Delete LDGR folder (this will cascade to all subfolders and files due to ON DELETE CASCADE)
    if (workspace.ldgr_folder_id) {
      console.log(`🗑️ Deleting LDGR folder: ${workspace.ldgr_folder_id}`)
      await deleteFolder(workspace.ldgr_folder_id)
    }

    // Delete workspace (this will cascade to channels, members, messages due to DB constraints)
    const { error: deleteError } = await supabase
      .from('wspr_workspaces')
      .delete()
      .eq('id', workspaceId)

    if (deleteError) throw deleteError

    console.log(`✅ Workspace ${workspaceId} and all associated data deleted`)
  } catch (error) {
    console.error('Error deleting workspace:', error)
    throw error
  }
}

/**
 * Delete channel and its LDGR subfolder
 */
export async function deleteChannel(channelId: string, userId: string): Promise<void> {
  try {
    // Get channel with folder info
    const { data: channel, error: channelError } = await supabase
      .from('wspr_channels')
      .select('ldgr_folder_id, created_by, workspace_id, wspr_workspaces!inner(owner_id)')
      .eq('id', channelId)
      .single()

    if (channelError) throw channelError
    if (!channel) throw new Error('Channel not found')
    
    // Verify user is channel creator or workspace owner
    const workspaceOwnerId = (channel.wspr_workspaces as any).owner_id
    if (channel.created_by !== userId && workspaceOwnerId !== userId) {
      throw new Error('Only channel creator or workspace owner can delete channel')
    }

    // Delete LDGR subfolder (this will cascade to all files due to ON DELETE CASCADE)
    if (channel.ldgr_folder_id) {
      console.log(`🗑️ Deleting LDGR subfolder: ${channel.ldgr_folder_id}`)
      await deleteFolder(channel.ldgr_folder_id)
    }

    // Delete channel (this will cascade to messages, members due to DB constraints)
    const { error: deleteError } = await supabase
      .from('wspr_channels')
      .delete()
      .eq('id', channelId)

    if (deleteError) throw deleteError

    console.log(`✅ Channel ${channelId} and all associated data deleted`)
  } catch (error) {
    console.error('Error deleting channel:', error)
    throw error
  }
}
