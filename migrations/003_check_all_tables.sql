-- Check ALL tables in public schema to see if there's a profiles or users table

SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
