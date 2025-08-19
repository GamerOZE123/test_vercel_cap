
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  hashtags: string[] | null;
  image_url: string | null;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url: string;
  };
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPostById = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching post:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    refetch: fetchPosts,
    getPostById
  };
};
