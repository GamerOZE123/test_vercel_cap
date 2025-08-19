
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  hashtags: string[];
  user_id: string;
  image_url?: string;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    refetch: fetchPosts
  };
};
