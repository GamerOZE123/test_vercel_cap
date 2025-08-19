
-- Add functionality to track trending hashtags
CREATE OR REPLACE VIEW public.trending_hashtags AS
SELECT 
  unnest(hashtags) as hashtag,
  COUNT(*) as post_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_used
FROM public.posts 
WHERE hashtags IS NOT NULL 
  AND array_length(hashtags, 1) > 0
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY unnest(hashtags)
ORDER BY post_count DESC, unique_users DESC
LIMIT 5;

-- Create a materialized view for better performance (optional but recommended)
CREATE MATERIALIZED VIEW public.trending_hashtags_mv AS
SELECT 
  unnest(hashtags) as hashtag,
  COUNT(*) as post_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_used
FROM public.posts 
WHERE hashtags IS NOT NULL 
  AND array_length(hashtags, 1) > 0
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY unnest(hashtags)
ORDER BY post_count DESC, unique_users DESC
LIMIT 5;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_trending_hashtags()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.trending_hashtags_mv;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on trending_hashtags table if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trending_hashtags') THEN
    ALTER TABLE public.trending_hashtags ENABLE ROW LEVEL SECURITY;
    
    -- Create policy to allow everyone to view trending hashtags
    DROP POLICY IF EXISTS "Trending hashtags are viewable by everyone" ON public.trending_hashtags;
    CREATE POLICY "Trending hashtags are viewable by everyone" 
      ON public.trending_hashtags 
      FOR SELECT 
      USING (true);
  END IF;
END $$;
