
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            full_name,
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching comments:', error);
        setComments([]);
        setCommentsCount(0);
        return;
      }

      console.log('Fetched comments:', data);
      
      // Transform the data to match our Comment interface
      const transformedComments: Comment[] = (data || []).map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user_id: comment.user_id,
        profiles: Array.isArray(comment.profiles) && comment.profiles.length > 0 
          ? comment.profiles[0]
          : comment.profiles || null
      }));
      
      setComments(transformedComments);
      setCommentsCount(transformedComments.length);
    } catch (error) {
      console.error('Error in fetchComments:', error);
      setComments([]);
      setCommentsCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId]);

  const addComment = async (content: string): Promise<boolean> => {
    if (!user || !content.trim()) {
      toast.error('Please enter a comment');
      return false;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles (
            full_name,
            username,
            avatar_url
          )
        `);

      if (error) {
        console.error('Error adding comment:', error);
        toast.error('Failed to add comment');
        return false;
      }

      console.log('Comment added:', data);
      if (data && data[0]) {
        const profileData = Array.isArray(data[0].profiles) && data[0].profiles.length > 0 
          ? data[0].profiles[0]
          : data[0].profiles;
          
        const newComment: Comment = {
          id: data[0].id,
          content: data[0].content,
          created_at: data[0].created_at,
          user_id: data[0].user_id,
          profiles: profileData || null
        };
        
        setComments(prev => [...prev, newComment]);
        setCommentsCount(prev => prev + 1);
      }
      
      toast.success('Comment added successfully');
      return true;
    } catch (error) {
      console.error('Error in addComment:', error);
      toast.error('Failed to add comment');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteComment = async (commentId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete comments');
      return false;
    }

    try {
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

      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setCommentsCount(prev => prev - 1);
      toast.success('Comment deleted successfully');
      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      toast.error('Failed to delete comment');
      return false;
    }
  };

  return {
    comments,
    commentsCount,
    loading,
    submitting,
    addComment,
    deleteComment,
    refetch: fetchComments
  };
};
