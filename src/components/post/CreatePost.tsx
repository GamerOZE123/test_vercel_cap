
import React, { useState } from 'react';
import { Image, MapPin, Smile, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const { user } = useAuth();

  // Extract hashtags from content
  const extractHashtags = (text: string) => {
    const hashtagRegex = /#[\w]+/g;
    return text.match(hashtagRegex) || [];
  };

  const hashtags = extractHashtags(content);

  const handlePost = async () => {
    if (!user || !content.trim()) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          content: content.trim(),
          user_id: user.id
        }]);

      if (error) throw error;

      setContent('');
      toast.success('Post created successfully!');
      if (onPostCreated) onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-white">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <Textarea
            placeholder="What's happening in your university? Use #hashtags to categorize your post!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none bg-transparent border-none p-0 text-base text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
          />
          
          {/* Display hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span>Hashtags:</span>
              </div>
              {hashtags.map((hashtag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {hashtag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Image className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <MapPin className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Smile className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-muted/50">
                <Hash className="w-5 h-5" />
              </Button>
            </div>
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!content.trim() || isPosting}
              onClick={handlePost}
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
