
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
  user_name?: string;
  user_username?: string;
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
      
      // Transform the data to add default user info since we don't have a users table join
      const transformedPosts = (data || []).map(post => ({
        ...post,
        user_name: post.user_name || 'Anonymous User',
        user_username: post.user_username || 'anonymous'
      }));
      
      setPosts(transformedPosts);
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
    refetch: fetchPosts,
    refreshPosts: fetchPosts // Add alias for backward compatibility
  };
};
