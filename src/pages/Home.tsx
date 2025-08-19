
import React from 'react';
import Layout from '@/components/layout/Layout';
import CreatePost from '@/components/post/CreatePost';
import PostCard from '@/components/post/PostCard';
import ImageUploadButton from '@/components/post/ImageUploadButton';
import { usePosts } from '@/hooks/usePosts';

export default function Home() {
  const { posts, loading, refetch } = usePosts();

  const handlePostCreated = () => {
    refetch();
  };

  return (
    <Layout>
      <div className="space-y-6">
        <CreatePost onPostCreated={handlePostCreated} />
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading posts...</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
          </div>
        )}
        
        <ImageUploadButton onPostCreated={handlePostCreated} />
      </div>
    </Layout>
  );
}
