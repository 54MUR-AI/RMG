-- Check for any Supabase Edge Functions or webhooks that might be interfering

-- Check for any database functions that might be called on auth
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%user%'
ORDER BY routine_name;

-- Check all triggers in the database
SELECT 
  trigger_schema,
  trigger_name,
  event_object_schema,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY event_object_table, trigger_name;
