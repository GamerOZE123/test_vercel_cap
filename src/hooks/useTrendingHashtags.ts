
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TrendingHashtag {
  hashtag: string;
  post_count: number;
  unique_users: number;
}

export const useTrendingHashtags = () => {
  const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrendingHashtags = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trending_hashtags')
        .select('*')
        .limit(5);
      
      if (error) throw error;
      setHashtags(data || []);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      setHashtags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  return {
    hashtags,
    loading,
    fetchTrendingHashtags
  };
};
