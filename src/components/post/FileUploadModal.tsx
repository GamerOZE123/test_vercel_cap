
import React, { useState } from 'react';
import { X, Upload, File, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

export default function FileUploadModal({ isOpen, onClose, onPostCreated }: FileUploadModalProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = text.match(hashtagRegex);
    return matches ? matches.map(tag => tag.substring(1).toLowerCase()) : [];
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!user || (!content.trim() && !selectedFile)) {
      toast.error('Please add content or select a file');
      return;
    }

    setUploading(true);
    
    try {
      let fileUrl = null;

      // Upload file if selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        console.log('Uploading file to bucket:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(fileName, selectedFile);

        if (uploadError) {
          console.error('File upload error:', uploadError);
          toast.error('Failed to upload file: ' + uploadError.message);
          return;
        }

        console.log('File uploaded successfully:', uploadData);

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(fileName);
        
        fileUrl = publicUrl;
        console.log('Public URL:', fileUrl);
      }

      // Extract hashtags from content
      const hashtags = extractHashtags(content);

      // Create post in database
      console.log('Creating post with user ID:', user.id);
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: content.trim() || 'Shared a file',
          image_url: fileUrl,
          hashtags: hashtags.length > 0 ? hashtags : null
        })
        .select();

      if (postError) {
        console.error('Post creation error:', postError);
        toast.error('Failed to create post: ' + postError.message);
        return;
      }

      console.log('Post created successfully:', postData);
      toast.success('Post created successfully!');
      setContent('');
      setSelectedFile(null);
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setContent('');
      setSelectedFile(null);
      onClose();
    }
  };

  const hashtags = extractHashtags(content);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Textarea
            placeholder="What's on your mind? Use #hashtags to categorize your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] resize-none"
            disabled={uploading}
          />

          {/* Show detected hashtags */}
          {hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
              <Hash className="w-4 h-4 text-primary mt-0.5" />
              {hashtags.map((tag, index) => (
                <span key={index} className="text-sm bg-primary/20 text-primary px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Attach File (Optional)</label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <Input
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={uploading}
                accept="*/*"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span className="text-sm">Click to select a file</span>
              </label>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <File className="w-4 h-4" />
                <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || (!content.trim() && !selectedFile)}
              className="flex-1"
            >
              {uploading ? 'Creating...' : 'Create Post'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
