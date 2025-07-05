-- Add new fields to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS is_vertical_list BOOLEAN DEFAULT false;
ALTER TABLE news ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE news ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Create unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug ON news (slug) WHERE slug IS NOT NULL;

-- Function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[áàâãä]', 'a', 'g'),
        '[éèêë]', 'e', 'g'
      ),
      '[^a-z0-9\s]', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing news with slugs
UPDATE news 
SET slug = generate_slug(title) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL;

-- Create view tracking table
CREATE TABLE IF NOT EXISTS news_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_news_views_news_id ON news_views (news_id);
CREATE INDEX IF NOT EXISTS idx_news_views_ip_date ON news_views (ip_address, created_at);
