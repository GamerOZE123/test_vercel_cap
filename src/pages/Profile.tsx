
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, MessageCircle, Calendar, MapPin, GraduationCap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFollow } from '@/hooks/useFollow';
import { useUsers } from '@/hooks/useUsers';
import { usePosts } from '@/hooks/usePosts';
import PostCard from '@/components/post/PostCard';
import EditProfileModal from '@/components/profile/EditProfileModal';

export default function Profile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { getUserById } = useUsers();
  const { isFollowing, followersCount, followingCount, toggleFollow } = useFollow(userId);
  const { posts, loading: postsLoading, refreshPosts } = usePosts(userId);
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (isOwnProfile && currentUser) {
          // For own profile, fetch from profiles table
          const userData = await getUserById(currentUser.id);
          setUser(userData);
        } else if (userId) {
          // For other users' profiles
          const userData = await getUserById(userId);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, currentUser, isOwnProfile, getUserById]);

  const handleProfileUpdate = async () => {
    setShowEditModal(false);
    // Refresh user data
    if (isOwnProfile && currentUser) {
      const userData = await getUserById(currentUser.id);
      setUser(userData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">User not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
              </span>
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl font-bold">{user.full_name || user.username}</h1>
                <span className="text-muted-foreground">@{user.username}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {user.university && (
                  <div className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {user.university}
                  </div>
                )}
                {user.major && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.major}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
              
              {user.bio && (
                <p className="text-muted-foreground max-w-2xl">{user.bio}</p>
              )}
              
              <div className="flex gap-6 text-sm">
                <span><strong>{followingCount}</strong> Following</span>
                <span><strong>{followersCount}</strong> Followers</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button onClick={() => setShowEditModal(true)} variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => toggleFollow()}
                    variant={isFollowing ? "outline" : "default"}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="likes">Likes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          {postsLoading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isOwnProfile ? "You haven't posted anything yet." : "No posts yet."}
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onUpdate={refreshPosts}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="media" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Media posts will appear here
          </div>
        </TabsContent>
        
        <TabsContent value="likes" className="space-y-4">
          <div className="text-center py-8 text-muted-foreground">
            Liked posts will appear here
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}
