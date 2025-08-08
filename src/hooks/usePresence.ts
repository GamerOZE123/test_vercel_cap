
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserPresence {
  user_id: string;
  is_online: boolean;
  last_seen: string;
}

export const usePresence = () => {
  const { user } = useAuth();
  const [presenceData, setPresenceData] = useState<Record<string, UserPresence>>({});

  useEffect(() => {
    if (!user) return;

    // For now, we'll use a simple approach with the profiles table
    // Update user's last seen timestamp
    const updatePresence = async () => {
      await supabase
        .from('profiles')
        .update({ 
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    };

    // Fetch all users and their last activity
    const fetchPresence = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('user_id, updated_at');
      
      if (data) {
        const presenceMap = data.reduce((acc, profile) => {
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          const lastSeen = new Date(profile.updated_at);
          
          acc[profile.user_id] = {
            user_id: profile.user_id,
            is_online: lastSeen > fiveMinutesAgo,
            last_seen: profile.updated_at
          };
          return acc;
        }, {} as Record<string, UserPresence>);
        setPresenceData(presenceMap);
      }
    };

    updatePresence();
    fetchPresence();

    // Update presence periodically
    const interval = setInterval(updatePresence, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence();
        fetchPresence();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const isUserOnline = (userId: string) => {
    const presence = presenceData[userId];
    if (!presence) return false;
    
    const lastSeen = new Date(presence.last_seen);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return presence.is_online && lastSeen > fiveMinutesAgo;
  };

  return {
    presenceData,
    isUserOnline
  };
};
