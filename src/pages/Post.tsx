
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import MobileLayout from '@/components/layout/MobileLayout';
import PostCard from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

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

export default function Post() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) return;
      
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profiles!inner (
              full_name,
              username,
              avatar_url,
              university
            )
          `)
          .eq('id', postId)
          .single();

        if (error) throw error;
        
        // Transform the data to match our Post interface
        const transformedPost = {
          ...data,
          profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles
        };
        
        setPost(transformedPost);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleBack = () => {
    navigate(-1);
  };

  const PostContent = () => (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : post ? (
        <PostCard {...post} isDetailView={true} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Post not found</p>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout showHeader={true} showNavigation={true}>
        <div className="p-4">
          <PostContent />
        </div>
      </MobileLayout>
    );
  }

  return (
    <Layout>
      <PostContent />
    </Layout>
  );
}
