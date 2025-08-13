
import React, { useState } from 'react';
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
}

export default function PostCard({ post, showEditOption = false, onEdit, onDelete }: PostCardProps) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  
  const { isLiked, likesCount, toggleLike, loading: likesLoading } = useLikes(post.id);
  const { comments, commentsCount, addComment, submitting } = useComments(post.id);

  const isOwnPost = user?.id === post.user_id;

  const handleEdit = () => onEdit?.(post.id);
  const handleDelete = () => onDelete?.(post.id);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
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
