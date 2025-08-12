
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, File, Image as ImageIcon, FileText, Video, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <ImageIcon className="w-12 h-12" />;
  if (fileType.startsWith('video/')) return <Video className="w-12 h-12" />;
  if (fileType.startsWith('audio/')) return <Music className="w-12 h-12" />;
  if (fileType.includes('pdf') || fileType.includes('document')) return <FileText className="w-12 h-12" />;
  return <File className="w-12 h-12" />;
};

const isImageFile = (fileType: string) => fileType.startsWith('image/');

export default function FileUploadModal({ isOpen, onClose, onPostCreated }: FileUploadModalProps) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Only create preview for images
      if (isImageFile(file.type)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!user || (!selectedFile && !caption.trim())) {
      toast.error('Please add a file or caption');
      return;
    }

    setUploading(true);
    try {
      let fileUrl = null;

      // Handle file upload
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        
        console.log('Uploading file:', fileName, 'Type:', selectedFile.type);
        
        // For now, we'll create a placeholder URL since storage isn't configured
        // In a real app, you would upload to Supabase storage here
        fileUrl = `https://via.placeholder.com/600x400?text=File+${fileName}`;
      }

      // Create the post
      console.log('Creating post with user:', user.id);
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: caption.trim() || `Shared ${selectedFile?.name || 'a file'}`,
          image_url: fileUrl
        })
        .select();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      console.log('Post created successfully:', data);
      toast.success('Post uploaded successfully!');
      
      // Reset form
      setSelectedFile(null);
      setFilePreview(null);
      setCaption('');
      
      // Notify parent and close modal
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error uploading post:', error);
      toast.error('Failed to upload post');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setCaption('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create New Post
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload Section */}
          <div className="border-2 border-dashed border-muted rounded-lg p-6">
            {selectedFile ? (
              <div className="relative">
                {isImageFile(selectedFile.type) && filePreview ? (
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 bg-muted/20 rounded-lg">
                    <div className="text-muted-foreground mb-2">
                      {getFileIcon(selectedFile.type)}
                    </div>
                    <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <File className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">Select any file to upload</p>
                <input
                  type="file"
                  accept="*/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Choose File
                </Button>
              </div>
            )}
          </div>

          {/* Caption Section */}
          <div>
            <Textarea
              placeholder="Write a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploading || (!selectedFile && !caption.trim())}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
