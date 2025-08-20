
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { X, Hash, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  hashtags?: string[];
  user_id?: string;
}

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onPostUpdated: () => void;
}

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }: EditPostModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content);
      setHashtags(post.hashtags || []);
    }
  }, [isOpen, post]);

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim().toLowerCase())) {
      const newTag = hashtagInput.trim().toLowerCase().replace(/^#+/, '');
      if (newTag) {
        setHashtags(prev => [...prev, newTag]);
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    }
  };

  const handleUpdate = async () => {
    if (!user || !content.trim()) {
      toast.error('Please add some content');
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        content: content.trim(),
        hashtags: hashtags.length > 0 ? hashtags : null,
        updated_at: new Date().toISOString()
      };

      console.log('Updating post with data:', updateData);

      const { error } = await supabase
        .from('posts')
        .update(updateData)
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
    setHashtags(post.hashtags || []);
    setHashtagInput('');
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
          {/* Show existing image if present */}
          {post.image_url && (
            <div className="border rounded-lg p-2">
              <img 
                src={post.image_url} 
                alt="Post image" 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content Section */}
          <div>
            <Textarea
              placeholder="Edit your post..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Hashtags Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              <Input
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add hashtag"
                className="flex-1"
              />
              <Button size="sm" onClick={addHashtag} disabled={!hashtagInput.trim()}>
                Add
              </Button>
            </div>
            
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <div key={index} className="flex items-center gap-1 bg-primary/10 text-primary rounded-full px-3 py-1 text-sm">
                    <Hash className="w-3 h-3" />
                    <span>{tag}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeHashtag(tag)}
                      className="h-auto p-0 w-4 h-4 hover:bg-transparent"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
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
