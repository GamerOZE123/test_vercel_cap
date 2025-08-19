
-- Add hashtags column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS hashtags text[];

-- Create a function to extract hashtags from post content
CREATE OR REPLACE FUNCTION extract_hashtags(content text)
RETURNS text[]
LANGUAGE plpgsql
AS $$
DECLARE
    hashtags text[];
BEGIN
    -- Extract hashtags from content using regex
    SELECT array_agg(DISTINCT lower(substring(match FROM 2)))
    INTO hashtags
    FROM regexp_split_to_table(content, '\s+') AS match
    WHERE match ~ '^#[a-zA-Z0-9_]+$';
    
    RETURN COALESCE(hashtags, '{}');
END;
$$;

-- Create a trigger to automatically extract hashtags when posts are inserted or updated
CREATE OR REPLACE FUNCTION update_hashtags_trigger()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.hashtags = extract_hashtags(NEW.content);
    RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS posts_hashtags_trigger ON posts;
CREATE TRIGGER posts_hashtags_trigger
    BEFORE INSERT OR UPDATE ON posts
    FOR EACH ROW
    EXECUTE FUNCTION update_hashtags_trigger();

-- Update existing posts to extract hashtags
UPDATE posts SET hashtags = extract_hashtags(content) WHERE hashtags IS NULL;

-- Create an index on hashtags for better performance
CREATE INDEX IF NOT EXISTS idx_posts_hashtags ON posts USING GIN (hashtags);

-- Create a view for trending hashtags
CREATE OR REPLACE VIEW trending_hashtags AS
SELECT 
    hashtag,
    COUNT(*) as post_count,
    COUNT(DISTINCT user_id) as unique_users
FROM (
    SELECT unnest(hashtags) as hashtag, user_id
    FROM posts
    WHERE created_at >= NOW() - INTERVAL '30 days'
    AND hashtags IS NOT NULL
) hashtag_posts
GROUP BY hashtag
ORDER BY post_count DESC, unique_users DESC
LIMIT 10;
