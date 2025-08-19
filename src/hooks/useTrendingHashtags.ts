
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrendingHashtag {
  hashtag: string;
  post_count: number;
  unique_users: number;
  last_used: string;
}

export const useTrendingHashtags = () => {
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingHashtags = async () => {
    try {
      const { data, error } = await supabase
        .from('trending_hashtags_mv')
        .select('*')
        .limit(5);
      
      if (error) {
        console.error('Error fetching trending hashtags:', error);
        // Fallback to regular view if materialized view fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .rpc('refresh_trending_hashtags');
        
        if (!fallbackError) {
          const { data: viewData } = await supabase
            .from('trending_hashtags')
            .select('*')
            .limit(5);
          setHashtags(viewData || []);
        }
      } else {
        setHashtags(data || []);
      }
    } catch (error) {
      console.error('Error in fetchTrendingHashtags:', error);
      setHashtags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  return { hashtags, loading, refetch: fetchTrendingHashtags };
};
