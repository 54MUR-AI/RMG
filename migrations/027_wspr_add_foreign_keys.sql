-- Add missing foreign key relationships for PostgREST joins
-- This allows Supabase queries to join wspr_profiles with other tables

-- Add foreign key from wspr_contacts.contact_id to wspr_profiles
ALTER TABLE wspr_contacts 
  DROP CONSTRAINT IF EXISTS wspr_contacts_contact_profile_fkey;

ALTER TABLE wspr_contacts 
  ADD CONSTRAINT wspr_contacts_contact_profile_fkey 
  FOREIGN KEY (contact_id) REFERENCES wspr_profiles(id) ON DELETE CASCADE;

-- Add foreign key from wspr_messages.user_id to wspr_profiles  
ALTER TABLE wspr_messages 
  DROP CONSTRAINT IF EXISTS wspr_messages_user_profile_fkey;

ALTER TABLE wspr_messages 
  ADD CONSTRAINT wspr_messages_user_profile_fkey 
  FOREIGN KEY (user_id) REFERENCES wspr_profiles(id) ON DELETE SET NULL;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
