CREATE OR REPLACE FUNCTION increment_views(blog_id INT)
RETURNS void AS $$
BEGIN
  UPDATE blogs
  SET views = COALESCE(views, 0) + 1
  WHERE id = blog_id;
END;
$$ LANGUAGE plpgsql;
