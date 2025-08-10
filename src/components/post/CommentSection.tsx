
import React, { useState } from 'react';
import { Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';

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

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (content: string) => Promise<void>;
}

export default function CommentSection({ postId, comments, onAddComment }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3 mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-white">
                  {comment.profiles?.full_name?.charAt(0) || comment.profiles?.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {comment.profiles?.full_name || comment.profiles?.username || 'User'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 min-h-[60px] resize-none"
            disabled={submitting}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!newComment.trim() || submitting}
            className="self-end"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
