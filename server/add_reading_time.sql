-- Add reading_time column to blogs table
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS reading_time text DEFAULT '5 Min Read';
