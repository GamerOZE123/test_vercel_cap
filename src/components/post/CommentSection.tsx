
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  comments: Comment[];
  onAddComment: (content: string) => Promise<boolean>;
  submitting: boolean;
}

export default function CommentSection({ comments, onAddComment, submitting }: CommentSectionProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const success = await onAddComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border">
      {/* Add Comment */}
      {user && (
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-muted/50 border-muted"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !submitting) {
                  handleAddComment();
                }
              }}
              disabled={submitting}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || submitting}
              size="sm"
            >
              {submitting ? 'Adding...' : 'Comment'}
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">
                {comment.profiles?.full_name?.charAt(0) || comment.profiles?.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 bg-muted/50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-foreground">
                  {comment.profiles?.full_name || comment.profiles?.username || 'Anonymous User'}
                </p>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-foreground">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
