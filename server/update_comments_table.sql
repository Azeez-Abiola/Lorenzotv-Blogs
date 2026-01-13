-- Update comments table to support guest comments
ALTER TABLE public.comments ALTER COLUMN author_id DROP NOT NULL;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS author_name text;
