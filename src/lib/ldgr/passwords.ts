import { supabase } from '../supabase'

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

// Encrypt password using Web Crypto API
async function encryptPassword(password: string, userEmail: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  
  // Derive key from user email
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userEmail),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ldgr-passwords-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  )
  
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  )
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength)
  combined.set(iv)
  combined.set(new Uint8Array(encryptedData), iv.length)
  
  // Encode to base64
  return btoa(String.fromCharCode(...combined))
}

// Decrypt password
export async function decryptPassword(encryptedPassword: string, userEmail: string): Promise<string> {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()
  
  // Decode from base64
  const combined = Uint8Array.from(atob(encryptedPassword), c => c.charCodeAt(0))
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12)
  const encryptedData = combined.slice(12)
  
  // Derive key from user email
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userEmail),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  )
  
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode('ldgr-passwords-salt'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  )
  
  return decoder.decode(decryptedData)
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
  userEmail: string,
  input: PasswordInput
): Promise<Password> {
  // Encrypt the password
  const encryptedPassword = await encryptPassword(input.password, userEmail)
  
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
  userEmail: string,
  updates: Partial<PasswordInput>
): Promise<Password> {
  const updateData: any = {}
  
  if (updates.title) updateData.title = updates.title
  if (updates.username) updateData.username = updates.username
  if (updates.url !== undefined) updateData.url = updates.url || null
  if (updates.category) updateData.category = updates.category
  if (updates.notes !== undefined) updateData.notes = updates.notes || null
  
  // Only encrypt if password is being updated
  if (updates.password) {
    updateData.encrypted_password = await encryptPassword(updates.password, userEmail)
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
