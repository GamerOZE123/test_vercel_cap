
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
  const [submitting, setSubmitting] = useState(false);
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
          profiles!comments_user_id_fkey (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log('Fetched comments:', data);
      
      // Transform the data to ensure profiles is a single object or null
      const transformedComments: Comment[] = (data || []).map(comment => ({
        ...comment,
        profiles: Array.isArray(comment.profiles) 
          ? comment.profiles[0] || null 
          : comment.profiles
      }));
      
      setComments(transformedComments);
      setCommentsCount(transformedComments.length);

      // Update post comments count
      if (transformedComments) {
        const { error: updateError } = await supabase
          .from('posts')
          .update({ comments_count: transformedComments.length })
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

    setSubmitting(true);
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
          profiles!comments_user_id_fkey (
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
      
      // Transform the data to ensure profiles is a single object or null
      const transformedComment: Comment = {
        ...data,
        profiles: Array.isArray(data.profiles) 
          ? data.profiles[0] || null 
          : data.profiles
      };
      
      setComments(prev => [...prev, transformedComment]);
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
    if (!user) return false;

    try {
      console.log('Deleting comment:', commentId);
      
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error deleting comment:', error);
        toast.error('Failed to delete comment');
        return false;
      }
      
      console.log('Comment deleted successfully');
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentsCount(prev => prev - 1);
      toast.success('Comment deleted!');
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
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
    submitting,
    commentsCount,
    addComment,
    deleteComment,
    refreshComments: fetchComments
  };
};
