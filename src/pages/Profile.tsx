import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import EditProfileModal from '@/components/profile/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Settings, MapPin, Calendar, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';

export default function Profile() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
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
          profiles:user_id (
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

  useEffect(() => {
    if (targetUserId) {
      fetchProfile();
      fetchUserPosts();
    }
  }, [targetUserId]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
                  
                  {isOwnProfile && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
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
                    <p className="text-xl font-bold text-foreground">0</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">0</p>
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
                user: {
                  name: post.profiles?.full_name || post.profiles?.username || 'Unknown User',
                  avatar: post.profiles?.full_name?.charAt(0) || post.profiles?.username?.charAt(0) || 'U',
                  university: post.profiles?.university || post.profiles?.major || 'University'
                },
                content: post.content || '',
                image: post.image_url,
                timestamp: new Date(post.created_at).toLocaleDateString()
              };
              
              return <PostCard key={post.id} post={transformedPost} />;
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

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </Layout>
  );
}
