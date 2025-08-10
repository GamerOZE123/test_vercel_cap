import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Settings, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFollow } from '@/hooks/useFollow';
import { useChat } from '@/hooks/useChat';
import { useRecentChats } from '@/hooks/useRecentChats';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import MobileLayout from '@/components/layout/MobileLayout';
import PostCard from '@/components/post/PostCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface UserProfile {
  user_id: string;
  full_name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  university?: string;
  major?: string;
  followers_count: number;
  following_count: number;
}

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

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { isFollowing, toggleFollow, canFollow } = useFollow(userId);
  const { createConversation } = useChat();
  const { addRecentChat } = useRecentChats();

  const isOwnProfile = user?.id === userId;

  const fetchProfile = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchPosts = async () => {
    if (!userId) return;
    
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our Post interface
      const transformedPosts = data?.map(post => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      })) || [];
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [userId]);

  const handleStartChat = async () => {
    if (!userId || !user) return;
    
    try {
      const conversationId = await createConversation(userId);
      if (conversationId) {
        await addRecentChat(userId);
        navigate('/chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleEditPost = (postId: string) => {
    // Implementation for editing posts
    console.log('Edit post:', postId);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);

      if (error) throw error;
      
      setPosts(posts.filter(p => p.id !== postId));
      toast.success('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading || !profile) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  const ProfileContent = () => (
    <div className="max-w-4xl mx-auto">
      {isMobile && (
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
      )}

      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
              </span>
            </div>
            {isOwnProfile && (
              <Button
                size="icon"
                variant="secondary"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
              >
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                {profile.university && (
                  <p className="text-sm text-muted-foreground">{profile.university}</p>
                )}
                {profile.major && (
                  <p className="text-sm text-muted-foreground">{profile.major}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    {canFollow && (
                      <Button
                        onClick={toggleFollow}
                        variant={isFollowing ? "outline" : "default"}
                      >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleStartChat}
                      className="flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mb-4">
              <div className="text-center">
                <div className="font-bold text-foreground">{posts.length}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground">{profile.followers_count || 0}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-foreground">{profile.following_count || 0}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-foreground">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6 mt-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                {...post}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="about" className="mt-6">
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4">About</h3>
            <div className="space-y-4">
              {profile.university && (
                <div>
                  <p className="text-sm text-muted-foreground">University</p>
                  <p className="text-foreground">{profile.university}</p>
                </div>
              )}
              {profile.major && (
                <div>
                  <p className="text-sm text-muted-foreground">Major</p>
                  <p className="text-foreground">{profile.major}</p>
                </div>
              )}
              {profile.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="text-foreground">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        onProfileUpdate={fetchProfile}
      />
    </div>
  );

  if (isMobile) {
    return (
      <MobileLayout showHeader={true} showNavigation={true}>
        <div className="p-4">
          <ProfileContent />
        </div>
      </MobileLayout>
    );
  }

  return (
    <Layout>
      <ProfileContent />
    </Layout>
  );
}
