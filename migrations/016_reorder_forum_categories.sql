-- Reorder forum categories to logical order
-- Current order is alphabetical, changing to: Announcements, General, Projects (OMNI, SCRP, LDGR, WSPR, STONKS), Support

-- First, delete existing categories
DELETE FROM forum_categories;

-- Insert categories in logical order
INSERT INTO forum_categories (name, description, icon) VALUES
  ('Announcements', 'Official announcements', '📢'),
  ('General', 'General discussion about RMG projects', '💬'),
  ('OMNI', 'Talk about OMNI features', '🌐'),
  ('SCRP', 'Web scraping discussions', '🕷️'),
  ('LDGR', 'Discuss LDGR secure file storage', '🔒'),
  ('WSPR', 'WSPR related topics', '📡'),
  ('STONKS', 'Market analysis and trading', '📈'),
  ('Support', 'Get help and support', '🆘');

-- Verify the new order
SELECT name, icon FROM forum_categories ORDER BY created_at;
