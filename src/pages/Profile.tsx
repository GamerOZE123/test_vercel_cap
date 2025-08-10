
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MobileLayout from '@/components/layout/MobileLayout';
import PostCard from '@/components/post/PostCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Settings, MapPin, Calendar, Edit, UserPlus, UserMinus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { useFollow } from '@/hooks/useFollow';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const isOwnProfile = !userId || userId === user?.id;
  const targetUserId = userId || user?.id;
  
  const { isFollowing, loading: followLoading, toggleFollow, canFollow } = useFollow(targetUserId);

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
    }
  };

  const fetchUserPosts = async () => {
    if (!targetUserId) return;
    
    try {
      console.log('Fetching posts for user:', targetUserId);
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
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log('Fetched user posts:', data);
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = () => {
    fetchProfile();
  };

  const handleEditPost = (postId: string) => {
    toast.info('Edit post functionality will be implemented soon!');
  };

  const handleDeletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [targetUserId]);

  if (loading) {
    const LoadingComponent = () => (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

    return isMobile ? (
      <MobileLayout showHeader={false} showNavigation={true}>
        <LoadingComponent />
      </MobileLayout>
    ) : (
      <Layout>
        <LoadingComponent />
      </Layout>
    );
  }

  const ProfileContent = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="relative">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-primary to-accent rounded-xl mb-4"></div>
          
          {/* Profile Info */}
          <div className="flex items-start gap-4">
            <div className="relative -mt-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-4 border-card">
                <span className="text-2xl font-bold text-white">
                  {profile?.full_name?.charAt(0) || profile?.username?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            
            <div className="flex-1 pt-2">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile?.full_name || profile?.username || 'Unknown User'}
                  </h1>
                  <p className="text-muted-foreground">
                    {profile?.major ? `${profile.major} Student` : 'Student'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile?.university || 'University'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isOwnProfile ? (
                    <>
                      {isMobile ? (
                        <Button variant="outline" size="icon" onClick={() => setIsEditModalOpen(true)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      )}
                      {!isMobile && (
                        <Button variant="ghost" size="icon">
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                    </>
                  ) : canFollow ? (
                    <Button 
                      onClick={toggleFollow} 
                      disabled={followLoading}
                      variant={isFollowing ? "outline" : "default"}
                      size="sm"
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
                  ) : null}
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-foreground leading-relaxed">
                  {profile?.bio || 'No bio available.'}
                </p>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{posts.length}</p>
                  <p className="text-sm text-muted-foreground">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{profile?.followers_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{profile?.following_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Following</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">
          {isOwnProfile ? 'Your Posts' : `${profile?.full_name || 'User'}'s Posts`}
        </h2>
        {posts.length > 0 ? (
          posts.map((post) => {
            const transformedPost = {
              id: post.id,
              user_id: post.user_id,
              user: {
                name: post.profiles?.full_name || post.profiles?.username || 'Unknown User',
                avatar: post.profiles?.full_name?.charAt(0) || post.profiles?.username?.charAt(0) || 'U',
                university: post.profiles?.university || post.profiles?.major || 'University'
              },
              content: post.content || '',
              image: post.image_url,
              timestamp: new Date(post.created_at).toLocaleDateString()
            };
            
            return (
              <PostCard 
                key={post.id} 
                post={transformedPost}
                showEditOption={isOwnProfile}
                onEdit={handleEditPost}
                onDelete={handleDeletePost}
              />
            );
          })
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isOwnProfile ? 'You haven\'t posted anything yet.' : 'This user hasn\'t posted anything yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <MobileLayout showHeader={false} showNavigation={true}>
          <div className="p-4">
            <ProfileContent />
          </div>
        </MobileLayout>
      ) : (
        <Layout>
          <ProfileContent />
        </Layout>
      )}

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
