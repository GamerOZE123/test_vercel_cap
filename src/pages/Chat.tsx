import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import UserSearch from '@/components/chat/UserSearch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Chat() {
  const { user } = useAuth();
  const { getUserById } = useUsers();
  const { conversations, currentMessages, loading, fetchMessages, sendMessage, createConversation, refreshConversations } = useChat();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  // Set up real-time message listening
  useEffect(() => {
    if (!selectedChat) return;

    console.log('Setting up real-time for conversation:', selectedChat.conversation_id);

    const channel = supabase
      .channel(`messages:${selectedChat.conversation_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedChat.conversation_id}`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessages(selectedChat.conversation_id);
          
          // Show notification if message is from another user
          if (payload.new.sender_id !== user?.id) {
            toast.success('New message received!');
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up channel');
      supabase.removeChannel(channel);
    };
  }, [selectedChat, user, fetchMessages]);

  const handleChatSelect = async (conversation: any) => {
    console.log('Selecting chat:', conversation);
    setSelectedChat(conversation);
    await fetchMessages(conversation.conversation_id);
  };

  const handleBackToList = () => {
    setSelectedChat(null);
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || sending) {
      console.log('Cannot send message: no chat selected, empty message, or already sending');
      return;
    }
    
    setSending(true);
    console.log('Sending message:', newMessage, 'to conversation:', selectedChat.conversation_id);
    
    try {
      const result = await sendMessage(selectedChat.conversation_id, newMessage);
      
      if (result.success) {
        setNewMessage('');
        await refreshConversations();
        toast.success('Message sent!');
      } else {
        console.error('Failed to send message:', result.error);
        toast.error(`Failed to send message: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStartChat = async (userId: string) => {
    try {
      console.log('Starting chat with user:', userId);
      const otherUser = await getUserById(userId);
      if (!otherUser) {
        toast.error('User not found');
        return;
      }

      const conversationId = await createConversation(userId);
      if (conversationId) {
        const tempChat = {
          conversation_id: conversationId,
          other_user_id: userId,
          other_user_name: otherUser.full_name || otherUser.username,
          other_user_avatar: otherUser.avatar_url,
          other_user_university: otherUser.university,
          last_message: '',
          last_message_time: new Date().toISOString(),
          unread_count: 0
        };

        console.log('Created temp chat:', tempChat);
        setSelectedChat(tempChat);
        await fetchMessages(conversationId);
        
        // Refresh conversations after a short delay
        setTimeout(async () => {
          await refreshConversations();
        }, 1000);
        
        toast.success('Chat started!');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  // Mobile view: show either chat list or selected conversation
  if (isMobile) {
    return (
      <Layout>
        <div className="h-[calc(100vh-8rem)] bg-card rounded-2xl overflow-hidden border border-border">
          {!selectedChat ? (
            // Chat List View (Mobile)
            <div className="flex flex-col h-full bg-card">
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Messages</h2>
                </div>
                <UserSearch onStartChat={handleStartChat} />
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((chat) => (
                    <div
                      key={chat.conversation_id}
                      className="p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/30"
                      onClick={() => handleChatSelect(chat)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {chat.other_user_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-foreground truncate">{chat.other_user_name || 'Unknown User'}</p>
                            <span className="text-xs text-muted-foreground">
                              {chat.last_message_time ? new Date(chat.last_message_time).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{chat.other_user_university || 'University'}</p>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {chat.last_message || 'Start a conversation'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Search for users to start a conversation
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Chat Messages View (Mobile)
            <div className="flex flex-col h-full bg-background">
              <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {selectedChat.other_user_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedChat.other_user_name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{selectedChat.other_user_university || 'University'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                {currentMessages.length > 0 ? (
                  currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-muted/50 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !sending) {
                        handleSendMessage();
                      }
                    }}
                    disabled={sending}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex bg-card rounded-2xl overflow-hidden border border-border">
        {/* Chat List */}
        <div className="w-1/3 border-r border-border flex flex-col bg-card">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Messages</h2>
            </div>
            <UserSearch onStartChat={handleStartChat} />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((chat) => (
                <div
                  key={chat.conversation_id}
                  className={`p-4 border-b border-border cursor-pointer transition-colors ${
                    selectedChat?.conversation_id === chat.conversation_id ? 'bg-muted/50' : 'hover:bg-muted/30'
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {chat.other_user_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground truncate">{chat.other_user_name || 'Unknown User'}</p>
                        <span className="text-xs text-muted-foreground">
                          {chat.last_message_time ? new Date(chat.last_message_time).toLocaleDateString() : ''}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{chat.other_user_university || 'University'}</p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {chat.last_message || 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                Search for users to start a conversation
              </div>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col bg-background">
          {selectedChat ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {selectedChat.other_user_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{selectedChat.other_user_name || 'Unknown User'}</p>
                    <p className="text-sm text-muted-foreground">{selectedChat.other_user_university || 'University'}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                {currentMessages.length > 0 ? (
                  currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-muted/50 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !sending) {
                        handleSendMessage();
                      }
                    }}
                    disabled={sending}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={sending || !newMessage.trim()}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-background">
              <p className="text-muted-foreground">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
