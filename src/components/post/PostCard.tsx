
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import EditPostModal from './EditPostModal';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  hashtags?: string[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_id?: string;
  user_name?: string;
  user_username?: string;
  profiles?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface PostCardProps {
  post: Post;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onPostUpdated?: () => void;
}

export default function PostCard({ post, onLike, onComment, onShare, onPostUpdated }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/hashtag/${hashtag}`);
  };

  const handleDeletePost = async () => {
    if (!user || user.id !== post.user_id) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id);

      if (error) throw error;

      toast.success('Post deleted successfully!');
      if (onPostUpdated) onPostUpdated();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleEditPost = () => {
    setIsEditModalOpen(true);
  };

  const handlePostEdit = () => {
    setIsEditModalOpen(false);
    if (onPostUpdated) onPostUpdated();
  };

  // Extract user info from either profiles object or direct properties
  const username = post.profiles?.username || post.user_username || 'user';
  const fullName = post.profiles?.full_name || post.user_name || 'Anonymous User';
  const avatarUrl = post.profiles?.avatar_url;
  const isOwnPost = user?.id === post.user_id;

  console.log('PostCard - post hashtags:', post.hashtags);

  return (
    <>
      <Card className="w-full bg-card border border-border hover:shadow-md transition-shadow">
        <div className="p-4 space-y-4">
          <PostHeader 
            username={username}
            fullName={fullName}
            avatarUrl={avatarUrl}
            createdAt={post.created_at}
            isOwnPost={isOwnPost}
            onEdit={handleEditPost}
            onDelete={handleDeletePost}
          />
          
          <PostContent 
            content={post.content}
            imageUrl={post.image_url}
          />
          
          {/* Display hashtags below the content */}
          {post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {post.hashtags.map((hashtag, index) => (
                <button
                  key={index}
                  onClick={() => handleHashtagClick(hashtag)}
                  className="text-blue-500 hover:text-blue-700 hover:underline text-sm font-medium cursor-pointer transition-colors"
                >
                  #{hashtag}
                </button>
              ))}
            </div>
          )}
          
          <PostActions 
            likesCount={post.likes_count}
            commentsCount={post.comments_count}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            postId={post.id}
            postContent={post.content}
          />
        </div>
      </Card>

      <EditPostModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        post={post}
        onPostUpdated={handlePostEdit}
      />
    </>
  );
}
