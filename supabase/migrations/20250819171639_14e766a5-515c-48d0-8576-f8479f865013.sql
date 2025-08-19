
-- Add a view for trending hashtags to efficiently calculate hashtag statistics
CREATE OR REPLACE VIEW public.trending_hashtags AS
SELECT 
  unnest(hashtags) as hashtag,
  COUNT(*) as post_count,
  COUNT(DISTINCT user_id) as unique_users,
  MAX(created_at) as last_used
FROM public.posts 
WHERE hashtags IS NOT NULL 
  AND array_length(hashtags, 1) > 0
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY unnest(hashtags)
ORDER BY post_count DESC, unique_users DESC
LIMIT 10;
