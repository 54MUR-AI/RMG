import { supabase } from '../supabase'
import { encryptText, decryptText, legacyDecryptText } from './encryption'

export interface Password {
  id: string
  user_id: string
  title: string
  username: string
  encrypted_password: string
  url?: string
  category: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PasswordInput {
  title: string
  username: string
  password: string
  url?: string
  category: string
  notes?: string
}

// Encrypt password using unified encryption (user ID + purpose-based key derivation)
async function encryptPassword(password: string, userId: string): Promise<string> {
  return encryptText(password, userId, 'passwords')
}

// Decrypt password — tries new system first, falls back to legacy email-based encryption
export async function decryptPassword(encryptedPassword: string, userIdOrEmail: string, userId?: string): Promise<string> {
  // If userId is provided separately, try new system with userId first
  if (userId) {
    try {
      return await decryptText(encryptedPassword, userId, 'passwords')
    } catch {
      // Fall back to legacy email-based decryption (hardcoded salt)
      const legacy = await legacyDecryptText(encryptedPassword, userIdOrEmail, 'ldgr-passwords-salt')
      if (legacy !== null) return legacy
      throw new Error('Failed to decrypt password')
    }
  }

  // Legacy path: userIdOrEmail could be email (old) or userId (new)
  try {
    return await decryptText(encryptedPassword, userIdOrEmail, 'passwords')
  } catch {
    const legacy = await legacyDecryptText(encryptedPassword, userIdOrEmail, 'ldgr-passwords-salt')
    if (legacy !== null) return legacy
    throw new Error('Failed to decrypt password')
  }
}

// Get all passwords for a user
export async function getUserPasswords(userId: string): Promise<Password[]> {
  const { data, error } = await supabase
    .from('passwords')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Get passwords by category
export async function getPasswordsByCategory(userId: string, category: string): Promise<Password[]> {
  const { data, error } = await supabase
    .from('passwords')
    .select('*')
    .eq('user_id', userId)
    .eq('category', category)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// Add a new password
export async function addPassword(
  userId: string,
  _userIdOrEmail: string,
  input: PasswordInput
): Promise<Password> {
  // Encrypt using userId (second param kept for API compatibility)
  const encryptedPassword = await encryptPassword(input.password, userId)
  
  const { data, error } = await supabase
    .from('passwords')
    .insert({
      user_id: userId,
      title: input.title,
      username: input.username,
      encrypted_password: encryptedPassword,
      url: input.url || null,
      category: input.category,
      notes: input.notes || null
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Update a password
export async function updatePassword(
  passwordId: string,
  userIdOrEmail: string,
  updates: Partial<PasswordInput>
): Promise<Password> {
  const updateData: Record<string, string | null> = {}
  
  if (updates.title) updateData.title = updates.title
  if (updates.username) updateData.username = updates.username
  if (updates.url !== undefined) updateData.url = updates.url || null
  if (updates.category) updateData.category = updates.category
  if (updates.notes !== undefined) updateData.notes = updates.notes || null
  
  // Only encrypt if password is being updated
  if (updates.password) {
    updateData.encrypted_password = await encryptPassword(updates.password, userIdOrEmail)
  }
  
  const { data, error } = await supabase
    .from('passwords')
    .update(updateData)
    .eq('id', passwordId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete a password
export async function deletePassword(passwordId: string): Promise<void> {
  const { error } = await supabase
    .from('passwords')
    .delete()
    .eq('id', passwordId)
  
  if (error) throw error
}
