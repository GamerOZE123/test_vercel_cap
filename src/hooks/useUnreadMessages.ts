
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchUnreadCounts = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('unread_messages')
        .select('conversation_id')
        .eq('user_id', user.id);

      if (data) {
        const counts = data.reduce((acc, item) => {
          acc[item.conversation_id] = (acc[item.conversation_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('unread_messages')
        .delete()
        .eq('user_id', user.id)
        .eq('conversation_id', conversationId);

      setUnreadCounts(prev => ({
        ...prev,
        [conversationId]: 0
      }));
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCounts();

      // Set up real-time subscription for unread messages
      const channel = supabase
        .channel('unread_messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'unread_messages',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchUnreadCounts(); // Refetch counts when unread messages change
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return {
    unreadCounts,
    markConversationAsRead,
    refreshUnreadCounts: fetchUnreadCounts
  };
};
