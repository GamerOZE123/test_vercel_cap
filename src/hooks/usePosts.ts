
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
    university?: string;
  };
}

export const usePosts = (userId?: string) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!inner (
            full_name,
            username,
            avatar_url,
            university
          )
        `)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('Fetched posts raw data:', data);
      
      // Transform the data to match the Post interface
      const transformedPosts: Post[] = (data || []).map((post: any) => ({
        id: post.id,
        content: post.content,
        image_url: post.image_url,
        created_at: post.created_at,
        updated_at: post.updated_at,
        user_id: post.user_id,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      }));
      
      console.log('Transformed posts:', transformedPosts);
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
  }, [userId]);

  return {
    posts,
    loading,
    refreshPosts: fetchPosts
  };
};
