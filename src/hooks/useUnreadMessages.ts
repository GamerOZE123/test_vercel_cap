
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchUnreadCounts = async () => {
    if (!user) return;

    try {
      // Get all conversations and their last message timestamp
      const { data: conversations } = await supabase.rpc('get_user_conversations', {
        target_user_id: user.id
      });

      if (conversations) {
        // For now, we'll use a simple approach - check if there are recent messages
        // from other users that might be "unread"
        const counts: Record<string, number> = {};
        
        for (const conv of conversations) {
          // Get messages from the last 24 hours that aren't from the current user
          const { data: recentMessages } = await supabase
            .from('messages')
            .select('id, sender_id, created_at')
            .eq('conversation_id', conv.conversation_id)
            .neq('sender_id', user.id)
            .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false });

          counts[conv.conversation_id] = recentMessages?.length || 0;
        }
        
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    // For now, we'll just reset the count locally
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: 0
    }));
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCounts();

      // Set up real-time subscription for messages
      const channel = supabase
        .channel('messages_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          () => {
            fetchUnreadCounts();
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
