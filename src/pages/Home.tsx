
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import ImageUploadButton from '@/components/post/ImageUploadButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Post {
  id: string;
  content: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    full_name: string;
    username: string;
    avatar_url?: string;
    university?: string;
  };
}

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      setError(null);
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            full_name,
            username,
            avatar_url,
            university
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        setError(`Error fetching posts: ${error.message}`);
        setPosts([]);
        return;
      }
      
      console.log('Raw fetched data:', data);
      
      if (!data || data.length === 0) {
        console.log('No posts found in database');
        setPosts([]);
        return;
      }
      
      // Transform the data to match our Post interface
      const transformedPosts = data.map(post => {
        console.log('Processing post:', post);
        
        // Handle the profiles relationship
        let profileData = post.profiles;
        if (Array.isArray(profileData)) {
          profileData = profileData[0];
        }
        
        if (!profileData) {
          console.warn('Post missing profile data:', post.id);
          // Provide fallback profile data
          profileData = {
            full_name: 'Unknown User',
            username: 'unknown',
            avatar_url: null,
            university: 'Unknown'
          };
        }
        
        const transformedPost = {
          ...post,
          profiles: profileData,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0
        };
        
        console.log('Transformed post:', transformedPost);
        return transformedPost;
      });
      
      console.log('All transformed posts:', transformedPosts);
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for new posts
  useEffect(() => {
    console.log('Setting up posts fetch and real-time subscription');
    fetchPosts();

    const channel = supabase
      .channel('posts_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('New post added via real-time:', payload);
          fetchPosts(); // Refresh posts when a new one is added
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Post updated via real-time:', payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-muted-foreground">Loading posts...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive text-sm">{error}</p>
            <button 
              onClick={fetchPosts}
              className="text-destructive hover:underline text-sm mt-2"
            >
              Try again
            </button>
          </div>
        )}
        
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => {
              console.log('Rendering post:', post.id, post);
              return <PostCard key={post.id} {...post} />;
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {error ? 'Unable to load posts due to an error.' : 'No posts yet. Start by uploading an image!'}
              </p>
              {!error && (
                <p className="text-sm text-muted-foreground">
                  Check the console for debugging information.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <ImageUploadButton onPostCreated={fetchPosts} />
    </Layout>
  );
}
