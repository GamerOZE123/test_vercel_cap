
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import CreatePost from '@/components/post/CreatePost';
import PostCard from '@/components/post/PostCard';
import { usePosts } from '@/hooks/usePosts';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { posts, loading, refreshPosts } = usePosts();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPosts();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshPosts();
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        <CreatePost onPostCreated={refreshPosts} />
        
        {loading && posts.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  ...post,
                  user_name: post.user?.name || post.user_name || 'Unknown User',
                  user_username: post.user?.username || post.user_username || 'unknown'
                }} 
              />
            ))}
            
            {posts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
