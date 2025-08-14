
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface ProfileData {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  university: string;
  major: string;
  bio: string;
  followers_count: number;
  following_count: number;
}

interface PostWithProfile {
  id: string;
  content: string;
  image?: string;
  timestamp: string;
  user_id: string;
  profiles: {
    username: string;
    full_name: string;
    avatar_url: string;
    university: string;
  };
}

interface BlockedUser {
  blocked_id: string;
  blocker_id: string;
  profiles?: {
    username: string;
    full_name: string;
  };
}

export default function Profile() {
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const isOwnProfile = !userId || userId === user?.id;
  const profileId = userId || user?.id;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (profileId) {
      fetchUserData(profileId);
      fetchUserPosts(profileId);
      if (isOwnProfile) {
        fetchBlockedUsers();
      }
    }
  }, [profileId, isOwnProfile]);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      if (user && profileData && !isOwnProfile) {
        try {
          const { data, error } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', profileData.user_id)
            .single();

          if (error && error.code !== 'PGRST116') throw error;
          setIsFollowing(!!data);
        } catch (error) {
          console.error("Error checking following status:", error);
        }
      }
    };

    checkFollowingStatus();
  }, [user, profileData, isOwnProfile]);

  const fetchUserPosts = async (userId: string) => {
    try {
      // First get the posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Then get the profile data for the user
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, university')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Combine the data
      const postsWithProfile: PostWithProfile[] = (postsData || []).map(post => ({
        ...post,
        timestamp: post.created_at,
        profiles: profileData
      }));

      setPosts(postsWithProfile);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const fetchBlockedUsers = async () => {
    if (!user) return;

    try {
      // First get blocked user IDs
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_users')
        .select('blocked_id, blocker_id')
        .eq('blocker_id', user.id);

      if (blockedError) throw blockedError;

      if (!blockedData || blockedData.length === 0) {
        setBlockedUsers([]);
        return;
      }

      // Get profile information for blocked users
      const blockedUserIds = blockedData.map(item => item.blocked_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name')
        .in('user_id', blockedUserIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const blockedUsersWithProfiles = blockedData.map(blockedItem => {
        const profile = profilesData?.find(p => p.user_id === blockedItem.blocked_id);
        return {
          ...blockedItem,
          profiles: profile ? {
            username: profile.username,
            full_name: profile.full_name
          } : undefined
        };
      });

      setBlockedUsers(blockedUsersWithProfiles);
    } catch (error) {
      console.error("Error fetching blocked users:", error);
    }
  };

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url, university, major, bio, followers_count, following_count')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      setProfileData(data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user || !profileData) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileData.user_id);

        if (error) throw error;
        setIsFollowing(false);
        toast.success(`Unfollowed ${profileData.full_name || profileData.username}`);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert([{ follower_id: user.id, following_id: profileData.user_id }]);

        if (error) throw error;
        setIsFollowing(true);
        toast.success(`Followed ${profileData.full_name || profileData.username}`);
      }

      // Refresh profile data to update counts
      fetchUserData(profileId);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
      toast.error("Failed to follow/unfollow user");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnblockUser = async (blockedUserId: string) => {
    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user?.id)
        .eq('blocked_id', blockedUserId);

      if (error) throw error;

      setBlockedUsers(blockedUsers.filter(blockedUser => blockedUser.blocked_id !== blockedUserId));
      toast.success('User unblocked successfully!');
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const transformPostsForPostCard = (posts: PostWithProfile[]) => {
    return posts.map(post => ({
      id: post.id,
      user: {
        name: post.profiles.full_name || post.profiles.username || 'Unknown',
        avatar: post.profiles.avatar_url || '',
        university: post.profiles.university || ''
      },
      content: post.content,
      image: post.image,
      timestamp: post.timestamp
    }));
  };

  if (loading) return <Layout><div className="text-center py-8">Loading...</div></Layout>;
  if (!profileData) return <Layout><div className="text-center py-8">User not found</div></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="post-card">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto md:mx-0">
              <span className="text-2xl md:text-3xl font-bold text-white">
                {profileData.full_name?.charAt(0) || profileData.username?.charAt(0) || 'U'}
              </span>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {profileData.full_name || profileData.username}
              </h1>
              <div className="space-y-1 text-muted-foreground mb-4">
                {profileData.username && (
                  <p className="text-sm">@{profileData.username}</p>
                )}
                {profileData.university && (
                  <p className="text-sm">{profileData.university}</p>
                )}
                {profileData.major && (
                  <p className="text-sm">{profileData.major}</p>
                )}
                {profileData.bio && (
                  <p className="text-sm mt-2">{profileData.bio}</p>
                )}
              </div>
              
              <div className="flex justify-center md:justify-start gap-4 mb-4">
                <div className="text-center">
                  <p className="font-bold text-foreground">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground">{profileData.followers_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground">{profileData.following_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
              
              {!isOwnProfile && (
                <div className="flex justify-center md:justify-start gap-2">
                  <Button
                    onClick={handleFollow}
                    variant={isFollowing ? "outline" : "default"}
                    className="flex items-center gap-2"
                    disabled={followLoading}
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="blocked">Blocked Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="space-y-4">
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={transformPostsForPostCard([post])[0]}
                  showEditOption={isOwnProfile}
                />
              ))
            ) : (
              <div className="post-card text-center py-8">
                <p className="text-muted-foreground">No posts yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="blocked" className="space-y-4">
            {isOwnProfile ? (
              blockedUsers.length > 0 ? (
                <div className="post-card">
                  <h3 className="text-lg font-semibold mb-4">Blocked Users</h3>
                  <div className="space-y-3">
                    {blockedUsers.map((blockedUser) => (
                      <div key={blockedUser.blocked_id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">
                            {blockedUser.profiles?.full_name || blockedUser.profiles?.username || 'Unknown User'}
                          </p>
                          {blockedUser.profiles?.username && (
                            <p className="text-sm text-muted-foreground">@{blockedUser.profiles.username}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblockUser(blockedUser.blocked_id)}
                        >
                          Unblock
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="post-card text-center py-8">
                  <p className="text-muted-foreground">No blocked users</p>
                </div>
              )
            ) : (
              <div className="post-card text-center py-8">
                <p className="text-muted-foreground">You can only view your own blocked users</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
