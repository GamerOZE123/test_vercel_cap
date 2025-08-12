
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import ImageUploadButton from '@/components/post/ImageUploadButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey (
            user_id,
            full_name,
            username,
            avatar_url,
            university,
            major
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
      
      console.log('Fetched posts:', data);
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback: fetch posts without profile data
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        
        console.log('Fallback posts data:', fallbackData);
        setPosts(fallbackData || []);
      } catch (fallbackError) {
        console.error('Fallback fetch failed:', fallbackError);
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription for new posts
  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel('posts_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('New post added:', payload);
          fetchPosts(); // Refresh posts when a new one is added
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('Post updated:', payload);
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => {
              console.log('Rendering post:', post);
              const transformedPost = {
                id: post.id,
                user_id: post.user_id,
                user: {
                  name: post.profiles?.full_name || post.profiles?.username || 'Unknown User',
                  avatar: (post.profiles?.full_name || post.profiles?.username || 'U').charAt(0).toUpperCase(),
                  university: post.profiles?.university || post.profiles?.major || 'University'
                },
                content: post.content || '',
                image: post.image_url,
                likes: post.likes_count || 0,
                comments: post.comments_count || 0,
                timestamp: new Date(post.created_at).toLocaleDateString()
              };
              
              return <PostCard key={post.id} post={transformedPost} />;
            })
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Start by uploading an image!</p>
            </div>
          )}
        </div>
      </div>
      
      <ImageUploadButton onPostCreated={fetchPosts} />
    </Layout>
  );
}
