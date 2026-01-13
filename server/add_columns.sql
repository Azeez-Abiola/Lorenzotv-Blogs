-- Add reading_time column if not exists
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS reading_time text DEFAULT '5 Min Read';

-- Add updated_at column if not exists
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT timezone('utc'::text, now());
