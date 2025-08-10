
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Menu } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useRecentChats } from '@/hooks/useRecentChats';
import { usePresence } from '@/hooks/usePresence';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileChatHeader from '@/components/chat/MobileChatHeader';
import { PresenceIndicator } from '@/components/ui/presence-indicator';
import UserSearch from '@/components/chat/UserSearch';
import Layout from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';

export default function Chat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getUserById } = useUsers();
  const { addRecentChat } = useRecentChats();
  const { isUserOnline } = usePresence();
  const { unreadCounts, markConversationAsRead } = useUnreadMessages();
  const isMobile = useIsMobile();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  const { conversations, messages, loading, sendMessage, createConversation, fetchMessages } = useChat(selectedConversationId);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('New message received:', payload);
          if (payload.new.conversation_id === selectedConversationId) {
            fetchMessages(selectedConversationId);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, fetchMessages]);

  const handleConversationSelect = async (conversation: any) => {
    setSelectedConversationId(conversation.conversation_id);
    setSelectedUser({
      id: conversation.other_user_id,
      full_name: conversation.other_user_name,
      username: conversation.other_user_name,
      avatar_url: conversation.other_user_avatar,
      university: conversation.other_user_university
    });

    if (isMobile) {
      setShowSidebar(false);
    }

    // Mark conversation as read
    await markConversationAsRead(conversation.conversation_id);
    
    // Add to recent chats
    await addRecentChat(conversation.other_user_id);
  };

  const handleUserSelect = async (userId: string) => {
    try {
      const conversationId = await createConversation(userId);
      if (conversationId) {
        setSelectedConversationId(conversationId);
        const userDetails = await getUserById(userId);
        setSelectedUser(userDetails);
        await addRecentChat(userId);
        
        if (isMobile) {
          setShowSidebar(false);
        }
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConversationId || !newMessage.trim()) return;

    const result = await sendMessage(selectedConversationId, newMessage);
    if (result.success) {
      setNewMessage('');
    }
  };

  const handleUsernameClick = () => {
    if (selectedUser?.id) {
      navigate(`/profile/${selectedUser.id}`);
    }
  };

  const handleBack = () => {
    if (isMobile) {
      if (selectedConversationId) {
        setSelectedConversationId(null);
        setSelectedUser(null);
        setShowSidebar(true);
      } else {
        navigate('/');
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-lg">Loading conversations...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-screen bg-background">
        {/* Mobile header when chat is selected */}
        {isMobile && selectedConversationId && selectedUser && (
          <MobileChatHeader
            user={selectedUser}
            onBack={handleBack}
            onUsernameClick={handleUsernameClick}
          />
        )}

        {/* Mobile header when no chat selected */}
        {isMobile && !selectedConversationId && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 md:hidden">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-lg font-semibold">Messages</h1>
              <div className="w-10" />
            </div>
          </div>
        )}

        {/* Sidebar/Conversation List */}
        {(!isMobile || showSidebar) && (
          <div className={`${isMobile ? 'w-full' : 'w-1/3'} border-r border-border bg-card ${isMobile ? 'pt-16' : ''}`}>
            <div className="p-4 border-b border-border">
              {!isMobile && <h2 className="text-lg font-semibold mb-4">Messages</h2>}
              <UserSearch onUserSelect={handleUserSelect} />
            </div>
            
            <div className="overflow-y-auto">
              {conversations.map((conversation) => (
                <div
                  key={conversation.conversation_id}
                  onClick={() => handleConversationSelect(conversation)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                    selectedConversationId === conversation.conversation_id ? 'bg-muted' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {conversation.other_user_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <PresenceIndicator 
                        isOnline={isUserOnline(conversation.other_user_id)}
                        hasUnread={unreadCounts[conversation.conversation_id] > 0}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{conversation.other_user_name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        {(!isMobile || selectedConversationId) && (
          <div className={`flex-1 flex flex-col ${isMobile && selectedConversationId ? 'pt-16' : ''}`}>
            {selectedConversationId ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-card">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
