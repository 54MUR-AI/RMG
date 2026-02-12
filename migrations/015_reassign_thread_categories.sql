-- Reassign threads to their correct categories based on title

-- Move welcome thread to Announcements
UPDATE forum_threads 
SET category_id = (SELECT id FROM forum_categories WHERE name = 'Announcements' LIMIT 1)
WHERE title LIKE '%Welcome to the Ronin Media Group Forum%';

-- Move HELP - OMNI to OMNI category
UPDATE forum_threads 
SET category_id = (SELECT id FROM forum_categories WHERE name = 'OMNI' LIMIT 1)
WHERE title = 'HELP - OMNI';

-- Move HELP - SCRP to SCRP category
UPDATE forum_threads 
SET category_id = (SELECT id FROM forum_categories WHERE name = 'SCRP' LIMIT 1)
WHERE title = 'HELP - SCRP';

-- Move HELP - LDGR to LDGR category
UPDATE forum_threads 
SET category_id = (SELECT id FROM forum_categories WHERE name = 'LDGR' LIMIT 1)
WHERE title = 'HELP - LDGR';

-- Move HELP - WSPR to WSPR category
UPDATE forum_threads 
SET category_id = (SELECT id FROM forum_categories WHERE name = 'WSPR' LIMIT 1)
WHERE title = 'HELP - WSPR';

-- Move HELP - STONKS to STONKS category
UPDATE forum_threads 
SET category_id = (SELECT id FROM forum_categories WHERE name = 'STONKS' LIMIT 1)
WHERE title = 'HELP - STONKS';

-- Verify the reassignments
SELECT 
  t.title,
  c.name as category_name,
  t.created_at
FROM forum_threads t
LEFT JOIN forum_categories c ON t.category_id = c.id
ORDER BY t.created_at DESC;
