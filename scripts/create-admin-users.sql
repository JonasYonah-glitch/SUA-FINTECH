-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for admin users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow all operations for admin users (in production, you should implement proper authentication)
CREATE POLICY "Allow all operations on admin_users" ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- Insert default admin user (password: admin123)
-- In production, use a proper password hashing library
INSERT INTO admin_users (username, email, password_hash) VALUES 
  ('admin', 'admin@suafintech.com.br', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')
ON CONFLICT (username) DO NOTHING;

-- Remove view count columns from news table
ALTER TABLE news DROP COLUMN IF EXISTS views;
ALTER TABLE news DROP COLUMN IF EXISTS view_count;

-- Drop the news_views table as it's no longer needed
DROP TABLE IF EXISTS news_views;
