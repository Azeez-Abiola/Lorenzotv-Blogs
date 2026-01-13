-- Use this script to insert default categories if they are missing
-- It will NOT error if they already exist.

INSERT INTO public.categories (name, slug)
VALUES 
    ('Technology', '/technology'),
    ('Lifestyle', '/lifestyle'),
    ('Design', '/design'),
    ('Business', '/business'),
    ('Founder''s Series', '/founders-series')
ON CONFLICT (name) DO NOTHING;

-- Also ensuring 'status' column exists in blogs just in case
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS status text DEFAULT 'published';
