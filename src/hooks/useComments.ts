
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
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    if (!postId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles!inner (
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
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (content: string) => {
    if (!user || !postId || !content.trim() || submitting) return false;

    setSubmitting(true);
    try {
      console.log('Adding comment:', { content, postId, userId: user.id });
      
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content: content.trim(),
          post_id: postId,
          user_id: user.id
        })
        .select(`
          *,
          profiles!inner (
            full_name,
            username,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
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
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user || submitting) return false;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCommentsCount(prev => Math.max(0, prev - 1));
      toast.success('Comment deleted!');
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, user]);

  return {
    comments,
    commentsCount,
    loading,
    submitting,
    addComment,
    deleteComment,
    refreshComments: fetchComments
  };
};
