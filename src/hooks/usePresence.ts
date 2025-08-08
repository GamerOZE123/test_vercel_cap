
import { useState, useEffect } from 'react';
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

    // For now, we'll simulate presence data using a simple approach
    // In a real implementation, you'd want to create the user_presence table
    const updatePresence = () => {
      // Mock presence data - everyone is considered online for now
      setPresenceData(prev => ({
        ...prev,
        [user.id]: {
          user_id: user.id,
          is_online: true,
          last_seen: new Date().toISOString()
        }
      }));
    };

    updatePresence();

    // Update presence periodically
    const interval = setInterval(updatePresence, 30000);

    // Cleanup
    return () => {
      clearInterval(interval);
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
