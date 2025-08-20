
import React, { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/post/PostCard';
import CreatePost from '@/components/post/CreatePost';
import FileUploadModal from '@/components/post/FileUploadModal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Home() {
  const { posts, loading, refetch } = usePosts();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handlePostCreated = () => {
    refetch();
  };

  const handlePostUpdated = () => {
    refetch();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="animate-pulse">
          <div className="bg-muted rounded-2xl h-32 mb-6"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-muted rounded-lg h-48 mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <CreatePost />
      
      <div className="flex justify-center">
        <Button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 py-2"
        >
          <Plus className="w-5 h-5 mr-2" />
          Upload Photo
        </Button>
      </div>

      <div className="space-y-6">
        {posts?.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onPostUpdated={handlePostUpdated}
          />
        ))}
      </div>

      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
