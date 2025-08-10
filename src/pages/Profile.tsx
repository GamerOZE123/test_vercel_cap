import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, UserPlus, Edit } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import MobileLayout from '@/components/layout/MobileLayout';
import PostCard from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { useRecentChats } from '@/hooks/useRecentChats';
import { useFollow } from '@/hooks/useFollow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import EditProfileModal from '@/components/profile/EditProfileModal';

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  university?: string;
  major?: string;
  bio?: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
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
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { createConversation } = useChat();
  const { addRecentChat } = useRecentChats();
  const { isFollowing, toggleFollow, canFollow } = useFollow(userId);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;

  const fetchProfile = async () => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      
      // Ensure posts_count is included, defaulting to 0 since it's not in the database
      const profileWithPostsCount: UserProfile = {
        ...data,
        posts_count: 0 // Will be updated when we fetch posts
      };
      
      setProfile(profileWithPostsCount);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    }
  };

  const fetchUserPosts = async () => {
    if (!targetUserId) return;
    
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
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Post interface
      const transformedPosts = data?.map(post => ({
        ...post,
        profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
      })) || [];
      
      setPosts(transformedPosts);
      
      // Update profile with actual posts count
      if (profile) {
        setProfile(prev => prev ? { ...prev, posts_count: transformedPosts.length } : null);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const handleStartChat = async () => {
    if (!user || !targetUserId || targetUserId === user.id) return;
    
    try {
      const conversationId = await createConversation(targetUserId);
      if (conversationId) {
        await addRecentChat(targetUserId);
        navigate('/chat');
        toast.success('Chat started!');
      } else {
        toast.error('Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleProfileUpdate = async () => {
    await fetchProfile();
    setIsEditModalOpen(false);
    toast.success('Profile updated successfully!');
  };

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [targetUserId]);

  useEffect(() => {
    setLoading(false);
  }, [profile, posts]);

  const ProfileContent = () => (
    <div className="max-w-2xl mx-auto">
      {!isOwnProfile && (
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </span>
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                {profile.university && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.university}</p>
                )}
                {profile.major && (
                  <p className="text-sm text-muted-foreground">{profile.major}</p>
                )}
                {profile.bio && (
                  <p className="text-foreground mt-2">{profile.bio}</p>
                )}
              </div>

              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleStartChat}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </Button>
                    {canFollow && (
                      <Button
                        onClick={toggleFollow}
                        variant={isFollowing ? "outline" : "default"}
                        className={isFollowing ? "" : "bg-accent hover:bg-accent/90"}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{profile.posts_count || 0}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{profile.followers_count || 0}</div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{profile.following_count || 0}</div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Posts</h2>
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Profile not found</p>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isOwnProfile && profile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
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
