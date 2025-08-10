import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import MobileLayout from '@/components/layout/MobileLayout';
import UserSearch from '@/components/chat/UserSearch';
import MobileChatHeader from '@/components/chat/MobileChatHeader';
import ChatActions from '@/components/chat/ChatActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { useRecentChats } from '@/hooks/useRecentChats';
import { useUsers } from '@/hooks/useUsers';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function Chat() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showUserList, setShowUserList] = useState(true);
  
  const { 
    conversations, 
    currentMessages, 
    loading: chatLoading,
    fetchMessages,
    sendMessage, 
    createConversation
  } = useChat();
  
  const { recentChats, addRecentChat, refreshRecentChats } = useRecentChats();
  const { getUserById } = useUsers();

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  const handleUserClick = async (userId: string) => {
    try {
      const userProfile = await getUserById(userId);
      if (userProfile) {
        setSelectedUser(userProfile);
        const conversationId = await createConversation(userId);
        setSelectedConversationId(conversationId);
        await addRecentChat(userId);
        
        if (isMobile) {
          setShowUserList(false);
        }
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;
    
    try {
      await sendMessage(selectedConversationId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleBackToUserList = () => {
    setShowUserList(true);
    setSelectedConversationId(null);
    setSelectedUser(null);
  };

  const handleUsernameClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const removeRecentChat = async (otherUserId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('recent_chats')
        .delete()
        .eq('user_id', user.id)
        .eq('other_user_id', otherUserId);
      
      if (error) throw error;
      
      // Refresh recent chats
      await refreshRecentChats();
      
      // If this was the selected chat, reset selection
      if (selectedUser?.user_id === otherUserId) {
        setSelectedConversationId(null);
        setSelectedUser(null);
        if (isMobile) {
          setShowUserList(true);
        }
      }
    } catch (error) {
      console.error('Error removing recent chat:', error);
    }
  };

  // Desktop Layout
  if (!isMobile) {
    return (
      <Layout>
        <div className="h-[calc(100vh-8rem)] flex gap-6">
          {/* User List */}
          <div className="w-1/3 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
            
            <UserSearch onStartChat={handleUserClick} />
            
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Chats</h3>
              {recentChats.map((chat) => (
                <div
                  key={chat.other_user_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div onClick={() => handleUserClick(chat.other_user_id)} className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {chat.other_user_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{chat.other_user_name}</p>
                      <p className="text-sm text-muted-foreground">{chat.other_user_university}</p>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChatActions onRemoveChat={() => removeRecentChat(chat.other_user_id)} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col">
            {selectedUser ? (
              <>
                <div className="p-6 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {selectedUser.full_name?.charAt(0) || selectedUser.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 
                        className="font-semibold text-foreground cursor-pointer hover:text-primary"
                        onClick={() => handleUsernameClick(selectedUser.user_id)}
                      >
                        {selectedUser.full_name || selectedUser.username}
                      </h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.university}</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {currentMessages && currentMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.sender_id === user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender_id === user?.id 
                            ? 'text-primary-foreground/70' 
                            : 'text-muted-foreground'
                        }`}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a user to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // Mobile Layout
  return (
    <>
      {showUserList ? (
        <MobileLayout showHeader={true} showNavigation={true}>
          <div className="p-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
            
            <UserSearch onStartChat={handleUserClick} />
            
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Chats</h3>
              {recentChats.map((chat) => (
                <div
                  key={chat.other_user_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                >
                  <div onClick={() => handleUserClick(chat.other_user_id)} className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {chat.other_user_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{chat.other_user_name}</p>
                      <p className="text-sm text-muted-foreground">{chat.other_user_university}</p>
                    </div>
                  </div>
                  <ChatActions onRemoveChat={() => removeRecentChat(chat.other_user_id)} />
                </div>
              ))}
            </div>
          </div>
        </MobileLayout>
      ) : (
        <div className="min-h-screen bg-background flex flex-col">
          <MobileChatHeader
            userName={selectedUser?.full_name || selectedUser?.username || 'Unknown User'}
            userUniversity={selectedUser?.university || 'University'}
            onBackClick={handleBackToUserList}
          />
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4 pt-20 pb-20">
            {currentMessages && currentMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-2xl ${
                    message.sender_id === user?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender_id === user?.id 
                      ? 'text-primary-foreground/70' 
                      : 'text-muted-foreground'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
