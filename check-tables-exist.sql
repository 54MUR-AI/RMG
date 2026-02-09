-- Check which tables actually exist in the database

SELECT 
  table_schema,
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_roles', 'folders', 'files', 'api_keys', 'forum_threads', 'forum_posts', 'forum_categories')
ORDER BY table_name;
