
import React from 'react';
import { Card } from '@/components/ui/card';
import PostHeader from './PostHeader';
import PostContent from './PostContent';
import PostActions from './PostActions';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  hashtags?: string[];
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: {
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
}

export default function PostCard({ post, onLike, onComment, onShare }: PostCardProps) {
  const navigate = useNavigate();

  const handleHashtagClick = (hashtag: string) => {
    navigate(`/hashtag/${hashtag}`);
  };

  return (
    <Card className="w-full bg-card border border-border hover:shadow-md transition-shadow">
      <div className="p-4 space-y-4">
        <PostHeader 
          username={post.profiles.username}
          fullName={post.profiles.full_name}
          avatarUrl={post.profiles.avatar_url}
          createdAt={post.created_at}
        />
        
        <PostContent 
          content={post.content}
          imageUrl={post.image_url}
        />
        
        {/* Display hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
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
        />
      </div>
    </Card>
  );
}
