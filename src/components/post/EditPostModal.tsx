
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import HashtagSelector from './HashtagSelector';

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostUpdated: () => void;
  post: {
    id: string;
    content: string;
    hashtags?: string[];
  };
}

export default function EditPostModal({ isOpen, onClose, onPostUpdated, post }: EditPostModalProps) {
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setHashtags(Array.isArray(post.hashtags) ? post.hashtags : []);
    }
  }, [post]);

  const handleUpdate = async () => {
    if (!content.trim()) {
      toast.error('Please add content');
      return;
    }

    setUpdating(true);
    try {
      const formattedHashtags = hashtags
        .filter(tag => tag.trim())
        .map(tag => tag.toLowerCase().replace(/^#+/, '').trim())
        .filter(tag => tag.length > 0);

      const { error } = await supabase
        .from('posts')
        .update({
          content: content.trim(),
          hashtags: formattedHashtags.length > 0 ? formattedHashtags : []
        })
        .eq('id', post.id);

      if (error) throw error;

      toast.success('Post updated successfully!');
      onPostUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setUpdating(false);
    }
  };

  const handleClose = () => {
    setContent(post.content);
    setHashtags(Array.isArray(post.hashtags) ? post.hashtags : []);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Post
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Textarea
              placeholder="Write your post..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Edit Hashtags
            </label>
            <HashtagSelector hashtags={hashtags} onHashtagsChange={setHashtags} />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUpdate} 
              disabled={updating || !content.trim()}
              className="flex-1"
            >
              {updating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
