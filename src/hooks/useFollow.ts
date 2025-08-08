
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useFollow = (targetUserId?: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [canFollow, setCanFollow] = useState(false);

  useEffect(() => {
    if (!user || !targetUserId) return;
    
    setCanFollow(user.id !== targetUserId);
    
    if (user.id === targetUserId) return;

    const checkFollowStatus = async () => {
      try {
        const { data } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .single();
        
        setIsFollowing(!!data);
      } catch (error) {
        console.error('Error checking follow status:', error);
        setIsFollowing(false);
      }
    };

    const fetchCounts = async () => {
      try {
        // Get followers count
        const { count: followers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', targetUserId);

        // Get following count
        const { count: following } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', targetUserId);

        setFollowersCount(followers || 0);
        setFollowingCount(following || 0);
      } catch (error) {
        console.error('Error fetching follow counts:', error);
      }
    };

    checkFollowStatus();
    fetchCounts();
  }, [user, targetUserId]);

  const toggleFollow = async () => {
    if (!user || !targetUserId || !canFollow || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        
        setIsFollowing(false);
        setFollowersCount(prev => Math.max(0, prev - 1));
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });
        
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    followersCount,
    followingCount,
    loading,
    toggleFollow,
    canFollow
  };
};
