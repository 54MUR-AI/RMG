import { supabase } from './supabase'

// Get user ID number for a given user_id
export async function getUserIdNumber(userId: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id_number')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data.user_id_number
}

// Get user info including ID number for admin display
export async function getUserInfoForAdmin(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id_number, email')
    .eq('user_id', userId)
    .maybeSingle()

  if (error || !data) return null
  return data
}
