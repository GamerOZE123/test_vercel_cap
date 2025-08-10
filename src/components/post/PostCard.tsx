
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection';

interface PostCardProps {
  id: string;
  content: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
    university?: string;
  };
  onClick?: () => void;
  isDetailView?: boolean;
}

export default function PostCard({ 
  id, 
  content, 
  image_url, 
  user_id, 
  created_at, 
  likes_count, 
  comments_count, 
  profiles,
  onClick,
  isDetailView = false
}: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const { isLiked, toggleLike } = useLikes(id);
  const { comments, addComment } = useComments(id);

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) {
      return;
    }
    
    if (onClick) {
      onClick();
    } else if (!isDetailView) {
      navigate(`/post/${id}`);
    }
  };

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${user_id}`);
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-200">
      <div 
        className={`${!isDetailView ? 'cursor-pointer' : ''}`}
        onClick={handlePostClick}
      >
        {/* User Info */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center cursor-pointer"
            onClick={handleUserClick}
          >
            <span className="text-sm font-bold text-white">
              {profiles.full_name?.charAt(0) || profiles.username?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1">
            <h3 
              className="font-semibold text-foreground hover:text-primary cursor-pointer"
              onClick={handleUserClick}
            >
              {profiles.full_name || profiles.username}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profiles.university} • {new Date(created_at).toLocaleDateString()}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="mb-4">
          <p className="text-foreground whitespace-pre-wrap">{content}</p>
          {image_url && (
            <div className="mt-4">
              <img 
                src={image_url} 
                alt="Post content" 
                className="w-full rounded-lg object-cover max-h-96"
              />
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleLike();
            }}
            className={`text-muted-foreground hover:text-red-500 ${
              isLiked ? 'text-red-500' : ''
            }`}
          >
            <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {likes_count}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowComments(!showComments);
            }}
            className="text-muted-foreground hover:text-blue-500"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {comments_count}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-green-500"
            onClick={(e) => e.stopPropagation()}
          >
            <Share className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Comments Section */}
      {(showComments || isDetailView) && (
        <CommentSection
          postId={id}
          comments={comments}
          onAddComment={addComment}
        />
      )}
    </div>
  );
}
