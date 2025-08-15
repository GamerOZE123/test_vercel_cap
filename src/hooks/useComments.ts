
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  post_id: string;
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
  } | null;
}

export const useComments = (postId: string) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsCount, setCommentsCount] = useState(0);

  const fetchComments = async () => {
    try {
      console.log('Fetching comments for post:', postId);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          post_id,
          profiles (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log('Fetched comments:', data);
      setComments(data || []);
      setCommentsCount(data?.length || 0);

      // Update post comments count
      if (data) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ comments_count: data.length })
          .eq('id', postId);

        if (updateError) console.error('Error updating comments count:', updateError);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !content.trim()) return false;

    try {
      console.log('Adding comment:', { postId, content, userId: user.id });
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          content: content.trim(),
          user_id: user.id
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          post_id,
          profiles (
            full_name,
            username,
            avatar_url
          )
        `)
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment');
        return false;
      }
      
      console.log('Comment added successfully:', data);
      setComments(prev => [...prev, data]);
      setCommentsCount(prev => prev + 1);
      toast.success('Comment added!');
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
      return false;
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  return {
    comments,
    loading,
    commentsCount,
    addComment,
    refreshComments: fetchComments
  };
};
