
import React from 'react';
import { Heart, MessageCircle, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PostActionsProps {
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  onLike: () => void;
  onComment: () => void;
  likesLoading?: boolean;
}

export default function PostActions({ 
  likesCount, 
  commentsCount, 
  isLiked, 
  onLike, 
  onComment,
  likesLoading = false 
}: PostActionsProps) {
  return (
    <div className="flex items-center justify-between pt-2 border-t border-border">
      <div className="flex items-center gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLike}
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
          onClick={onComment}
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
  );
}
