
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Heart, MessageCircle, Settings, LogOut, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import PostCard from '@/components/post/PostCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { useFollow } from '@/hooks/useFollow';
import { toast } from 'sonner';

interface Profile {
  user_id: string;
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  university: string;
  major: string;
  followers_count: number;
  following_count: number;
}

interface Post {
  id: string;
  content: string;
  image_url: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
  user_id: string;
  user?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const targetUserId = userId || user?.id;
  const isOwnProfile = user?.id === targetUserId;
  
  const { 
    isFollowing, 
    loading: followLoading, 
    toggleFollow,
    canFollow
  } = useFollow(targetUserId || '');

  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const fetchProfile = async () => {
    if (!targetUserId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', targetUserId)
        .single();
      
      if (error) throw error;
      setProfile(data);
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
          profiles!posts_user_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const postsWithUser = data.map(post => ({
        ...post,
        user: {
          username: post.profiles?.username || '',
          full_name: post.profiles?.full_name || '',
          avatar_url: post.profiles?.avatar_url || ''
        }
      }));
      
      setPosts(postsWithUser);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      setLoading(true);
      Promise.all([fetchProfile(), fetchUserPosts()]);
    }
  }, [targetUserId]);

  const handleStartChat = async () => {
    if (!targetUserId || !user) return;
    
    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        user1_id: user.id,
        user2_id: targetUserId
      });
      
      if (error) throw error;
      navigate('/chat');
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile not found</h2>
          <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="post-card">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {profile.full_name?.charAt(0) || profile.username?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{profile.full_name || profile.username}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                {profile.university && (
                  <p className="text-sm text-muted-foreground mt-1">{profile.university}</p>
                )}
                {profile.major && (
                  <p className="text-sm text-muted-foreground">{profile.major}</p>
                )}
              </div>
            </div>
            
            {/* Settings Icon (only on own profile) */}
            {isOwnProfile && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {profile.bio && (
            <p className="text-foreground mb-4">{profile.bio}</p>
          )}

          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{profile.followers_count}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-primary">{profile.following_count}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {isOwnProfile ? (
              <Button onClick={() => setIsEditModalOpen(true)} className="flex-1">
                Edit Profile
              </Button>
            ) : (
              <>
                <Button 
                  onClick={toggleFollow}
                  disabled={followLoading}
                  variant={isFollowing ? "outline" : "default"}
                  className="flex-1"
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4 mr-2" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
                <Button onClick={handleStartChat} variant="outline">
                  Message
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Posts */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="liked" className="flex-1">Liked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4 mt-6">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {isOwnProfile ? "Share your first post!" : "This user hasn't posted anything yet."}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="space-y-4 mt-6">
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Liked posts</h3>
              <p className="text-muted-foreground">Posts you've liked will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdate={fetchProfile}
      />
    </Layout>
  );
}
