
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
  user?: {
    name: string;
    username: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          users (
            name,
            username
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match expected format
      const transformedPosts = (data || []).map(post => ({
        ...post,
        user: post.users ? {
          name: post.users.name,
          username: post.users.username
        } : undefined,
        user_name: post.users?.name || 'Unknown User',
        user_username: post.users?.username || 'unknown'
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
