-- Garantir que a tabela news tenha todas as colunas necessárias
ALTER TABLE news ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS hero_position INTEGER DEFAULT NULL;
ALTER TABLE news ADD COLUMN IF NOT EXISTS is_vertical_list BOOLEAN DEFAULT false;
ALTER TABLE news ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]';
ALTER TABLE news ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Criar índices para performance
CREATE UNIQUE INDEX IF NOT EXISTS idx_news_slug ON news (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_hero_position ON news (hero_position) WHERE hero_position IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_published ON news (is_published);
CREATE INDEX IF NOT EXISTS idx_news_featured ON news (is_featured);

-- Garantir que as políticas RLS permitam todas as operações
DROP POLICY IF EXISTS "Allow public read access on news" ON news;
DROP POLICY IF EXISTS "Allow public insert access on news" ON news;
DROP POLICY IF EXISTS "Allow public update access on news" ON news;
DROP POLICY IF EXISTS "Allow public delete access on news" ON news;

-- Criar políticas mais permissivas para desenvolvimento
CREATE POLICY "Allow all operations on news" ON news FOR ALL USING (true) WITH CHECK (true);

-- Fazer o mesmo para categories
DROP POLICY IF EXISTS "Allow public read access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public insert access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public update access on categories" ON categories;
DROP POLICY IF EXISTS "Allow public delete access on categories" ON categories;

CREATE POLICY "Allow all operations on categories" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Atualizar notícias existentes sem slug
UPDATE news 
SET slug = lower(
  regexp_replace(
    regexp_replace(title, '[^a-zA-Z0-9\s]', '', 'g'),
    '\s+', '-', 'g'
  )
) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL OR slug = '';
