import { supabase } from './supabase'

export interface Contact {
  contact_id: string
  contact_email: string
  contact_display_name: string
  contact_avatar_url: string | null
  contact_avatar_color: string | null
  contact_status: string
  relationship_status: string
  created_at: string
}

export interface PendingRequest {
  request_id: string
  sender_id: string
  sender_email: string
  sender_display_name: string
  sender_avatar_url: string | null
  sender_avatar_color: string | null
  created_at: string
}

export interface SearchResult {
  user_id: string
  email: string
  display_name: string
  avatar_url: string | null
  avatar_color: string | null
  status: string
  is_contact: boolean
  contact_status: string | null
}

/**
 * Get user's accepted contacts
 */
export async function getContacts(userId: string): Promise<Contact[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_user_contacts', { user_id_param: userId })

    if (error) {
      console.error('Error fetching contacts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Contacts fetch error:', error)
    return []
  }
}

/**
 * Get pending contact requests (incoming)
 */
export async function getPendingRequests(userId: string): Promise<PendingRequest[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_pending_contact_requests', { user_id_param: userId })

    if (error) {
      console.error('Error fetching pending requests:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Pending requests error:', error)
    return []
  }
}

/**
 * Search users to add as contacts
 */
export async function searchUsers(query: string, currentUserId: string): Promise<SearchResult[]> {
  try {
    if (!query.trim()) {
      return []
    }

    const { data, error } = await supabase
      .rpc('search_users_for_contacts', {
        search_query: query,
        current_user_id: currentUserId
      })

    if (error) {
      console.error('Error searching users:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('User search error:', error)
    return []
  }
}

/**
 * Send contact request
 */
export async function sendContactRequest(userId: string, contactId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rmg_contacts')
      .insert({
        user_id: userId,
        contact_id: contactId,
        status: 'pending'
      })

    if (error) {
      console.error('Error sending contact request:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Contact request error:', error)
    return false
  }
}

/**
 * Accept contact request
 */
export async function acceptContactRequest(requestId: string, userId: string, senderId: string): Promise<boolean> {
  try {
    // Update the original request to accepted
    const { error: updateError } = await supabase
      .from('rmg_contacts')
      .update({ status: 'accepted' })
      .eq('id', requestId)

    if (updateError) {
      console.error('Error accepting request:', updateError)
      return false
    }

    // Create reciprocal contact
    const { error: insertError } = await supabase
      .from('rmg_contacts')
      .insert({
        user_id: userId,
        contact_id: senderId,
        status: 'accepted'
      })

    if (insertError) {
      console.error('Error creating reciprocal contact:', insertError)
      return false
    }

    return true
  } catch (error) {
    console.error('Accept request error:', error)
    return false
  }
}

/**
 * Decline contact request
 */
export async function declineContactRequest(requestId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rmg_contacts')
      .delete()
      .eq('id', requestId)

    if (error) {
      console.error('Error declining request:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Decline request error:', error)
    return false
  }
}

/**
 * Block contact
 */
export async function blockContact(userId: string, contactId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rmg_contacts')
      .update({ status: 'blocked' })
      .eq('user_id', userId)
      .eq('contact_id', contactId)

    if (error) {
      console.error('Error blocking contact:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Block contact error:', error)
    return false
  }
}

/**
 * Remove contact (both directions)
 */
export async function removeContact(userId: string, contactId: string): Promise<boolean> {
  try {
    // Remove both directions
    const { error } = await supabase
      .from('rmg_contacts')
      .delete()
      .or(`and(user_id.eq.${userId},contact_id.eq.${contactId}),and(user_id.eq.${contactId},contact_id.eq.${userId})`)

    if (error) {
      console.error('Error removing contact:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Remove contact error:', error)
    return false
  }
}

/**
 * Check if two users are contacts
 */
export async function areContacts(userId: string, contactId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('rmg_contacts')
      .select('id')
      .or(`and(user_id.eq.${userId},contact_id.eq.${contactId}),and(user_id.eq.${contactId},contact_id.eq.${userId})`)
      .eq('status', 'accepted')
      .limit(1)

    if (error) {
      console.error('Error checking contact status:', error)
      return false
    }

    return (data && data.length > 0) || false
  } catch (error) {
    console.error('Contact check error:', error)
    return false
  }
}

/**
 * Subscribe to contact changes
 */
export function subscribeToContacts(userId: string, callback: () => void) {
  const subscription = supabase
    .channel('rmg-contacts')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rmg_contacts',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rmg_contacts',
        filter: `contact_id=eq.${userId}`
      },
      callback
    )
    .subscribe()

  return subscription
}
