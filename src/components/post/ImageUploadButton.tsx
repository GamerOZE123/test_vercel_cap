
import React, { useRef, useState } from 'react';
import { Plus, Image } from 'lucide-react';
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
    // Reset the input value so the same file can be selected again
    event.target.value = '';
  };

  const handleUpload = async (file: File, caption: string) => {
    if (!user) return;

    setIsUploading(true);
    try {
      // Upload image to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: caption || 'Shared an image',
          image_url: publicUrl
        });

      if (postError) throw postError;

      toast.success('Post uploaded successfully!');
      setIsModalOpen(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error uploading post:', error);
      toast.error('Failed to upload post. Please try again.');
    } finally {
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
