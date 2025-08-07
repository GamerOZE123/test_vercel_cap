
import React, { useState } from 'react';
import { Heart, MessageCircle, Share, Bookmark, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: {
    id: number;
    user: {
      name: string;
      avatar: string;
      university: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    timestamp: string;
  };
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <article className="post-card animate-fade-in">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-bold text-white">{post.user.avatar}</span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{post.user.name}</p>
            <p className="text-sm text-muted-foreground">{post.user.university} • {post.timestamp}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="btn-ghost">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-foreground leading-relaxed mb-3">{post.content}</p>
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

      {/* Post Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              'btn-ghost gap-2',
              liked && 'text-red-500 hover:text-red-600'
            )}
            onClick={() => setLiked(!liked)}
          >
            <Heart className={cn('w-5 h-5', liked && 'fill-current')} />
            <span>{liked ? post.likes + 1 : post.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="btn-ghost gap-2">
            <MessageCircle className="w-5 h-5" />
            <span>{post.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="btn-ghost">
            <Share className="w-5 h-5" />
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            'btn-ghost',
            saved && 'text-primary hover:text-primary/80'
          )}
          onClick={() => setSaved(!saved)}
        >
          <Bookmark className={cn('w-5 h-5', saved && 'fill-current')} />
        </Button>
      </div>
    </article>
  );
}
