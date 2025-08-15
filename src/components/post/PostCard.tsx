
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import CommentSection from './CommentSection';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';

interface PostCardProps {
  post: {
    id: string;
    user_id?: string;
    user: {
      name: string;
      avatar: string;
      university: string;
    };
    content: string;
    image?: string;
    timestamp: string;
  };
  showEditOption?: boolean;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  clickable?: boolean;
}

export default function PostCard({ 
  post, 
  showEditOption = false, 
  onEdit, 
  onDelete,
  clickable = true 
}: PostCardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  
  const { isLiked, likesCount, toggleLike, loading: likesLoading } = useLikes(post.id);
  const { comments, commentsCount, addComment, submitting } = useComments(post.id);

  const isOwnPost = user?.id === post.user_id;

  const handleEdit = () => onEdit?.(post.id);
  const handleDelete = () => onDelete?.(post.id);

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('a') || 
      target.closest('[role="button"]') ||
      !clickable
    ) {
      return;
    }
    
    navigate(`/post/${post.id}`);
  };

  return (
    <div 
      className={`md:bg-card md:border md:border-border md:rounded-2xl p-4 md:p-6 space-y-4 border-b border-border md:border-b-0 ${
        clickable ? 'cursor-pointer hover:bg-surface/50 transition-colors' : ''
      }`}
      onClick={handlePostClick}
    >
      <PostHeader
        user={post.user}
        timestamp={post.timestamp}
        isOwnPost={showEditOption && isOwnPost}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PostContent
        content={post.content}
        fileUrl={post.image}
      />

      <PostActions
        likesCount={likesCount}
        commentsCount={commentsCount}
        isLiked={isLiked}
        onLike={toggleLike}
        onComment={() => setShowComments(!showComments)}
        likesLoading={likesLoading}
      />

      {showComments && (
        <CommentSection
          comments={comments}
          onAddComment={addComment}
          submitting={submitting}
        />
      )}
    </div>
  );
}
