
import React, { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImageUploadModal from './ImageUploadModal';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ImageUploadButton() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setIsModalOpen(true);
    }
    event.target.value = '';
  };

  const handleUpload = async (file: File, caption: string) => {
    if (!user) {
      toast.error('Please log in to upload posts');
      return;
    }

    setIsUploading(true);
    try {
      console.log('Starting upload process...');
      
      // Create post first without image
      const { data: postData, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: caption || 'Shared an image',
          image_url: null
        })
        .select()
        .single();

      if (postError) {
        console.error('Post creation error:', postError);
        throw postError;
      }

      console.log('Post created:', postData);

      // For now, we'll use a data URL as the image URL
      // In production, you would upload to a storage service
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageDataUrl = e.target?.result as string;
        
        // Update the post with the image data URL
        const { error: updateError } = await supabase
          .from('posts')
          .update({ image_url: imageDataUrl })
          .eq('id', postData.id);

        if (updateError) {
          console.error('Image update error:', updateError);
          throw updateError;
        }

        console.log('Post updated with image');
        toast.success('Post uploaded successfully!');
        setIsModalOpen(false);
        setSelectedImage(null);
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading post:', error);
      toast.error('Failed to upload post. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedImage(null);
        }}
        selectedImage={selectedImage}
        onUpload={handleUpload}
        isUploading={isUploading}
      />
    </>
  );
}
