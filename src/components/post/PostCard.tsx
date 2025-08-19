
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useLikes } from '@/hooks/useLikes';
import { useComments } from '@/hooks/useComments';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import CommentSection from './CommentSection';
import ClickablePostCard from './ClickablePostCard';
import { Hash } from 'lucide-react';

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
  hashtags?: string[];
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
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

  // Create user object for PostHeader
  const userForHeader = {
    name: post.user_name || 'Anonymous User',
    avatar: (post.user_name || 'A').charAt(0).toUpperCase(),
    university: post.user_university || 'University'
  };

  return (
    <ClickablePostCard postId={post.id}>
      <Card className="bg-card border-border">
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
          
          {/* Display hashtags */}
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.hashtags.map((tag, index) => (
                <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                  <Hash className="w-3 h-3" />
                  <span>{tag}</span>
                </div>
              ))}
            </div>
          )}
          
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
    </ClickablePostCard>
  );
}
