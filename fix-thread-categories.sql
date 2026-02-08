-- Check threads with null category_id (orphaned by category deletion)
SELECT id, title, category_id, created_at 
FROM forum_threads 
WHERE category_id IS NULL 
ORDER BY created_at DESC;

-- Check current category IDs
SELECT id, name FROM forum_categories ORDER BY created_at;

-- If threads are orphaned, we need to reassign them
-- First, let's see what categories the threads were originally in by their names
-- We'll need to manually map old threads to new categories

-- For now, assign all orphaned threads to General category
UPDATE forum_threads 
SET category_id = (SELECT id FROM forum_categories WHERE name = 'General' LIMIT 1)
WHERE category_id IS NULL;

-- Verify threads are now assigned
SELECT 
  t.title,
  c.name as category_name,
  t.created_at
FROM forum_threads t
LEFT JOIN forum_categories c ON t.category_id = c.id
ORDER BY t.created_at DESC;
