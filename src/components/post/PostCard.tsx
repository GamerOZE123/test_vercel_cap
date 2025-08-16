
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import { useNavigate } from 'react-router-dom';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import CommentSection from './CommentSection';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_id: string;
  user_name: string;
  user_username: string;
  user_university?: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);
  const { isLiked, likesCount, toggleLike, loading: likesLoading } = useLikes(post.id);
  const { 
    comments, 
    commentsCount, 
    addComment, 
    deleteComment, 
    submitting: commentsSubmitting 
  } = useComments(post.id);

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) {
      return;
    }
    navigate(`/post/${post.id}`);
  };

  // Create user object for PostHeader
  const userForHeader = {
    name: post.user_name || 'Anonymous User',
    avatar: (post.user_name || 'A').charAt(0).toUpperCase(),
    university: post.user_university || 'University'
  };

  return (
    <Card className="bg-card border-border cursor-pointer hover:shadow-md transition-shadow" onClick={handlePostClick}>
      <div className="p-6">
        <PostHeader
          user={userForHeader}
          timestamp={new Date(post.created_at).toLocaleDateString()}
          isOwnPost={false}
        />
        
        <PostContent
          content={post.content}
          fileUrl={post.image_url}
        />
        
        <PostActions
          postId={post.id}
          postContent={post.content}
          likesCount={likesCount}
          commentsCount={commentsCount}
          isLiked={isLiked}
          onLike={toggleLike}
          onComment={handleToggleComments}
          likesLoading={likesLoading}
        />
        
        {showComments && (
          <CommentSection
            comments={comments}
            onAddComment={addComment}
            onDeleteComment={deleteComment}
            submitting={commentsSubmitting}
          />
        )}
      </div>
    </Card>
  );
}
