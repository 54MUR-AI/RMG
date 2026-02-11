import { supabase } from './supabase'

export interface UserRole {
  id: string
  user_id: string
  email: string
  is_admin: boolean
  is_moderator: boolean
  user_id_number: number | null
  created_at: string
  updated_at: string
}

// Check if current user is admin
export async function isAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('user_roles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return false
  return data.is_admin
}

// Check if current user is moderator or admin
export async function isModerator(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from('user_roles')
    .select('is_admin, is_moderator')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return false
  return data.is_admin || data.is_moderator
}

// Get user role
export async function getUserRole(userId?: string): Promise<UserRole | null> {
  const { data: { user } } = await supabase.auth.getUser()
  const targetUserId = userId || user?.id
  if (!targetUserId) return null

  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', targetUserId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching user role:', error)
    return null
  }
  return data
}

// Moderator: Pin/Unpin thread
export async function toggleThreadPin(threadId: string, isPinned: boolean): Promise<boolean> {
  if (!await isModerator()) return false

  const { error } = await supabase
    .from('forum_threads')
    .update({ is_pinned: isPinned, updated_at: new Date().toISOString() })
    .eq('id', threadId)

  return !error
}

// Moderator: Lock/Unlock thread
export async function toggleThreadLock(threadId: string, isLocked: boolean): Promise<boolean> {
  if (!await isModerator()) return false

  const { error } = await supabase
    .from('forum_threads')
    .update({ is_locked: isLocked, updated_at: new Date().toISOString() })
    .eq('id', threadId)

  return !error
}

// Moderator: Delete any thread
export async function deleteThread(threadId: string): Promise<boolean> {
  if (!await isModerator()) return false

  const { error } = await supabase
    .from('forum_threads')
    .delete()
    .eq('id', threadId)

  return !error
}

// Moderator: Delete any post
export async function deletePost(postId: string): Promise<boolean> {
  if (!await isModerator()) return false

  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId)

  return !error
}

// Admin: Create/Update category
export async function upsertCategory(category: {
  id?: string
  name: string
  description?: string
  icon?: string
}): Promise<boolean> {
  if (!await isAdmin()) return false

  const { error } = await supabase
    .from('forum_categories')
    .upsert(category)

  return !error
}

// Admin: Delete category
export async function deleteCategory(categoryId: string): Promise<boolean> {
  if (!await isAdmin()) return false

  const { error } = await supabase
    .from('forum_categories')
    .delete()
    .eq('id', categoryId)

  return !error
}

// Admin: Get all users with roles
export async function getAllUsers(): Promise<UserRole[]> {
  if (!await isAdmin()) return []

  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return []
  return data
}

// Admin: Update user role
export async function updateUserRole(
  userId: string,
  updates: { is_admin?: boolean; is_moderator?: boolean }
): Promise<boolean> {
  if (!await isAdmin()) return false

  const { error } = await supabase
    .from('user_roles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  return !error
}
