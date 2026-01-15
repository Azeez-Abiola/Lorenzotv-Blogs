-- SQL Migration Script
-- Run this in your Supabase SQL Editor

-- 1. Add status column to comments table
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- 2. Create the increment_views function (if not already created)
CREATE OR REPLACE FUNCTION increment_views(blog_id INT)
RETURNS void AS $$
BEGIN
  UPDATE blogs
  SET views = COALESCE(views, 0) + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;
