
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import ImageUploadModal from './ImageUploadModal';

interface ImageUploadButtonProps {
  onPostCreated?: () => void;
}

export default function ImageUploadButton({ onPostCreated }: ImageUploadButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();

  const handlePostCreated = () => {
    if (onPostCreated) {
      onPostCreated();
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className={`fixed ${isMobile ? 'bottom-24' : 'bottom-6'} right-6 w-16 h-16 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground z-50`}
        size="icon"
      >
        <Plus className="w-8 h-8" />
      </Button>

      <ImageUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </>
  );
}
