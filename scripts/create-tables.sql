-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  author TEXT DEFAULT 'Redação SUA FINTECH',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, color) VALUES 
  ('Fintech', '#3B82F6'),
  ('Regulamentação', '#EF4444'),
  ('Startups', '#10B981'),
  ('Mercado', '#F59E0B'),
  ('Tecnologia', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- Create RLS policies
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Update RLS policies to allow public access for reading published news
-- and allow all operations without authentication for admin panel

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access on news" ON news;
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on news" ON news;
DROP POLICY IF EXISTS "Allow all operations for authenticated users on categories" ON categories;

-- Create new policies that allow public access for admin operations
-- In production, you should implement proper authentication
CREATE POLICY "Allow public read access on news" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on news" ON news FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on news" ON news FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on news" ON news FOR DELETE USING (true);

CREATE POLICY "Allow public read access on categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on categories" ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on categories" ON categories FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on categories" ON categories FOR DELETE USING (true);
