
import React from 'react';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import ImageUploadButton from '@/components/post/ImageUploadButton';
import { usePosts } from '@/hooks/usePosts';

export default function Home() {
  const { posts, loading, refreshPosts } = usePosts();

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 md:px-0">
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} onUpdate={refreshPosts} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Start by uploading an image!</p>
            </div>
          )}
        </div>
      </div>
      
      <ImageUploadButton onPostCreated={refreshPosts} />
    </Layout>
  );
}
