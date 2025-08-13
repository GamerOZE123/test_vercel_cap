
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import ImageUploadButton from '@/components/post/ImageUploadButton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PostData {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles: {
    full_name?: string;
    username?: string;
    university?: string;
    major?: string;
    avatar_url?: string;
  } | null;
}

interface TransformedPost {
  id: string;
  user_id: string;
  user: {
    name: string;
    avatar: string;
    university: string;
  };
  content: string;
  image?: string;
  timestamp: string;
}

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<TransformedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      console.log('Fetching posts...');
      
      // First get all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (postsError) {
        console.error('Error fetching posts:', postsError);
        throw postsError;
      }
      
      console.log('Fetched posts:', postsData);
      
      if (!postsData || postsData.length === 0) {
        setPosts([]);
        setLoading(false);
        return;
      }
      
      // Get unique user IDs from posts
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      
      // Fetch profiles for these users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, university, major, avatar_url')
        .in('user_id', userIds);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }
      
      console.log('Fetched profiles:', profilesData);
      
      // Create a map of user_id to profile
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
      
      // Transform posts data with profile information
      const transformedPosts = postsData.map((post) => {
        const profile = profilesMap.get(post.user_id);
        
        // Create user display data with proper fallbacks
        const userName = profile?.full_name || profile?.username || 'Anonymous User';
        const userAvatar = userName.charAt(0).toUpperCase();
        const userUniversity = profile?.university || 'University';
        
        return {
          id: post.id,
          user_id: post.user_id,
          user: {
            name: userName,
            avatar: userAvatar,
            university: userUniversity
          },
          content: post.content || '',
          image: post.image_url,
          timestamp: new Date(post.created_at).toLocaleDateString()
        };
      });
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
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
          fetchPosts();
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
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Start by uploading a file!</p>
            </div>
          )}
        </div>
      </div>
      
      <ImageUploadButton onPostCreated={fetchPosts} />
    </Layout>
  );
}
