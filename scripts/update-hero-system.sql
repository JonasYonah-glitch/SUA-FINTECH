-- Add hero position field to news table
ALTER TABLE news ADD COLUMN hero_position INTEGER DEFAULT NULL;

-- Create unique constraint to ensure only one news per hero position
CREATE UNIQUE INDEX idx_news_hero_position ON news (hero_position) WHERE hero_position IS NOT NULL;

-- Update some existing news to be hero positions for testing
UPDATE news SET hero_position = 1 WHERE is_featured = true LIMIT 1;
UPDATE news SET hero_position = 2 WHERE is_featured = true AND hero_position IS NULL LIMIT 1;
UPDATE news SET hero_position = 3 WHERE is_featured = true AND hero_position IS NULL LIMIT 1;
