
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

    // Update user's presence to online
    const updatePresence = async () => {
      await supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: true,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    };

    // Fetch initial presence data
    const fetchPresence = async () => {
      const { data } = await supabase
        .from('user_presence')
        .select('*');
      
      if (data) {
        const presenceMap = data.reduce((acc, item) => {
          acc[item.user_id] = item;
          return acc;
        }, {} as Record<string, UserPresence>);
        setPresenceData(presenceMap);
      }
    };

    updatePresence();
    fetchPresence();

    // Set up real-time subscription for presence updates
    const channel = supabase
      .channel('user_presence')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setPresenceData(prev => ({
              ...prev,
              [payload.new.user_id]: payload.new as UserPresence
            }));
          }
        }
      )
      .subscribe();

    // Update presence periodically and on page visibility change
    const interval = setInterval(updatePresence, 30000); // Update every 30 seconds

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence();
      } else {
        // Mark as offline when page is hidden
        supabase
          .from('user_presence')
          .upsert({
            user_id: user.id,
            is_online: false,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      supabase.removeChannel(channel);
      
      // Mark as offline on cleanup
      supabase
        .from('user_presence')
        .upsert({
          user_id: user.id,
          is_online: false,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    };
  }, [user]);

  const isUserOnline = (userId: string) => {
    const presence = presenceData[userId];
    if (!presence) return false;
    
    // Consider user online if they were active in the last 5 minutes
    const lastSeen = new Date(presence.last_seen);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    return presence.is_online && lastSeen > fiveMinutesAgo;
  };

  return {
    presenceData,
    isUserOnline
  };
};
