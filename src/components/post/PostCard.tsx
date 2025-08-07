
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: string;
    user: {
      name: string;
      avatar: string;
      university: string;
    };
    content: string;
    image?: string;
    timestamp: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  const { isLiked, likesCount, toggleLike, loading: likesLoading } = useLikes(post.id);
  const { comments, commentsCount, addComment, submitting } = useComments(post.id);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    const success = await addComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">{post.user.avatar}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{post.user.name}</p>
            <p className="text-sm text-muted-foreground">{post.user.university}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{post.timestamp}</span>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <p className="text-foreground leading-relaxed">{post.content}</p>
        {post.image && (
          <div className="rounded-xl overflow-hidden">
            <img 
              src={post.image} 
              alt="Post content" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLike}
            disabled={likesLoading}
            className={cn(
              "flex items-center gap-2 hover:bg-muted/50",
              isLiked && "text-red-500 hover:text-red-600"
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
            <span className="font-medium">{likesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:bg-muted/50"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{commentsCount}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-muted/50">
            <Share className="w-5 h-5" />
            <span className="font-medium">Share</span>
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
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
                      {comment.profiles?.full_name || comment.profiles?.username || 'Unknown User'}
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
      )}
    </div>
  );
}
