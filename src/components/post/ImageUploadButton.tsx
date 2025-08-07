
import React, { useRef } from 'react';
import { Plus, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadButtonProps {
  onImageSelect: (file: File) => void;
  isUploading?: boolean;
}

export default function ImageUploadButton({ onImageSelect, isUploading }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isUploading}
        className="fixed bottom-24 md:bottom-8 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg z-40"
        size="icon"
      >
        {isUploading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Plus className="w-6 h-6" />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
