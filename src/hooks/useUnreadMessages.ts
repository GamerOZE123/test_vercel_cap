
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUnreadMessages = () => {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const fetchUnreadCounts = async () => {
    if (!user) return;

    try {
      // Since we don't have an unread_messages table, we'll simulate this
      // by counting recent messages in conversations where the user is not the sender
      const { data: conversations } = await supabase
        .from('conversations')
        .select(`
          id,
          messages!inner(
            id,
            sender_id,
            created_at
          )
        `);

      if (conversations) {
        const counts: Record<string, number> = {};
        
        conversations.forEach(conversation => {
          // Count messages from others in the last hour as "unread"
          const recentMessages = conversation.messages?.filter(msg => 
            msg.sender_id !== user.id &&
            new Date(msg.created_at) > new Date(Date.now() - 60 * 60 * 1000)
          ) || [];
          
          if (recentMessages.length > 0) {
            counts[conversation.id] = recentMessages.length;
          }
        });
        
        setUnreadCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;

    // For now, just clear the local count
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
        .channel('unread_messages')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages'
          },
          () => {
            fetchUnreadCounts(); // Refetch counts when messages change
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
