
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
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
  const [showComments, setShowComments] = useState(false);
  const { isLiked, likesCount, toggleLike, loading: likesLoading } = useLikes(post.id, post.likes_count);
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

  return (
    <Card className="bg-card border-border">
      <div className="p-6">
        <PostHeader
          userName={post.user_name}
          userUsername={post.user_username}
          userUniversity={post.user_university}
          createdAt={post.created_at}
          userId={post.user_id}
        />
        
        <PostContent
          content={post.content}
          imageUrl={post.image_url}
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
