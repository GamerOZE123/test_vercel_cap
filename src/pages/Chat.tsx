
import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import MobileLayout from '@/components/layout/MobileLayout';
import UserSearch from '@/components/chat/UserSearch';
import MobileChatHeader from '@/components/chat/MobileChatHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Send, ArrowLeft, MoreVertical, Trash2, MessageSquareX, UserX, UserCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { useRecentChats } from '@/hooks/useRecentChats';
import { useUsers } from '@/hooks/useUsers';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Chat() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showUserList, setShowUserList] = useState(true);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const previousMessagesLength = useRef(0);
  
  const { 
    conversations, 
    currentMessages, 
    loading: chatLoading,
    fetchMessages,
    sendMessage, 
    createConversation,
    refreshConversations
  } = useChat();
  
  const { recentChats, addRecentChat, refreshRecentChats } = useRecentChats();
  const { getUserById } = useUsers();

  // Fetch blocked users on component mount
  useEffect(() => {
    const fetchBlockedUsers = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('blocked_users')
          .select('blocked_id')
          .eq('blocker_id', user.id);
        
        if (error) throw error;
        
        const blockedSet = new Set(data.map(block => block.blocked_id));
        setBlockedUsers(blockedSet);
      } catch (error) {
        console.error('Error fetching blocked users:', error);
      }
    };

    fetchBlockedUsers();
  }, [user]);

  // Listen for new messages to show unread indicators
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('new-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          const newMessage = payload.new;
          // If message is not from current user and not in current conversation
          if (newMessage.sender_id !== user.id && newMessage.conversation_id !== selectedConversationId) {
            // Find the other user in this conversation
            const conversation = conversations.find(conv => conv.conversation_id === newMessage.conversation_id);
            if (conversation) {
              setUnreadMessages(prev => new Set([...prev, conversation.other_user_id]));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversationId, conversations]);

  // Auto-scroll to bottom when new messages arrive (only if user isn't scrolling)
  useEffect(() => {
    if (currentMessages && currentMessages.length > previousMessagesLength.current && !isUserScrolling) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    previousMessagesLength.current = currentMessages?.length || 0;
  }, [currentMessages?.length, isUserScrolling]);

  // Handle scroll detection
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      
      if (!isAtBottom) {
        setIsUserScrolling(true);
        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        // Reset scrolling state after 3 seconds of no scrolling
        scrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false);
        }, 3000);
      } else {
        setIsUserScrolling(false);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      }
    }
  };

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
    }
  }, [selectedConversationId, fetchMessages]);

  // Auto-scroll to bottom when selecting a new conversation
  useEffect(() => {
    if (selectedConversationId && currentMessages) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedConversationId]);

  const handleUserClick = async (userId: string) => {
    try {
      const userProfile = await getUserById(userId);
      if (userProfile) {
        setSelectedUser(userProfile);
        const conversationId = await createConversation(userId);
        setSelectedConversationId(conversationId);
        await addRecentChat(userId);
        
        // Mark messages as read (remove red dot)
        setUnreadMessages(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
        
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
      // Refresh conversations and recent chats to update order
      refreshConversations();
      refreshRecentChats();
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

  const handleClearChat = async () => {
    if (!selectedConversationId || !user) return;
    
    try {
      // Delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', selectedConversationId);
      
      if (messagesError) throw messagesError;
      
      toast.success('Chat cleared successfully');
      
      // Refresh messages to show empty chat
      await fetchMessages(selectedConversationId);
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  const handleDeleteChat = async () => {
    if (!selectedConversationId || !user) return;
    
    try {
      // Delete all messages in the conversation
      await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', selectedConversationId);
      
      // Delete conversation participants
      await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', selectedConversationId);
      
      // Delete the conversation
      await supabase
        .from('conversations')
        .delete()
        .eq('id', selectedConversationId);
      
      // Remove from recent chats
      if (selectedUser) {
        await supabase
          .from('recent_chats')
          .delete()
          .eq('user_id', user.id)
          .eq('other_user_id', selectedUser.user_id);
      }
      
      toast.success('Chat deleted successfully');
      handleBackToUserList();
      
      // Refresh conversations to remove from list
      refreshConversations();
      refreshRecentChats();
    } catch (error) {
      console.error('Error deleting chat:', error);
      toast.error('Failed to delete chat');
    }
  };

  const handleBlockUser = async () => {
    if (!selectedUser?.user_id || !user) return;
    
    try {
      await supabase.from('blocked_users').insert({
        blocker_id: user.id,
        blocked_id: selectedUser.user_id
      });
      
      setBlockedUsers(prev => new Set([...prev, selectedUser.user_id]));
      toast.success('User blocked successfully');
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedUser?.user_id || !user) return;
    
    try {
      await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', selectedUser.user_id);
      
      setBlockedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedUser.user_id);
        return newSet;
      });
      
      toast.success('User unblocked successfully');
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const isUserBlocked = selectedUser ? blockedUsers.has(selectedUser.user_id) : false;

  // Filter messages if user is blocked
  const filteredMessages = isUserBlocked ? [] : currentMessages;

  // Desktop Layout
  if (!isMobile) {
    return (
      <Layout showHeader={false}>
        <div className="h-screen flex gap-6 p-6">
          {/* User List */}
          <div className="w-1/3 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
            
            <UserSearch onStartChat={handleUserClick} />
            
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Chats</h3>
              {recentChats.map((chat) => (
                <div
                  key={chat.other_user_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors relative"
                  onClick={() => handleUserClick(chat.other_user_id)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center relative">
                    <span className="text-sm font-bold text-white">
                      {chat.other_user_name?.charAt(0) || 'U'}
                    </span>
                    {unreadMessages.has(chat.other_user_id) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{chat.other_user_name}</p>
                    <p className="text-sm text-muted-foreground">{chat.other_user_university}</p>
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
                  <div className="flex items-center justify-between">
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
                    
                    {/* Chat Options */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!isUserBlocked ? (
                          <>
                            <DropdownMenuItem onClick={handleClearChat}>
                              <MessageSquareX className="w-4 h-4 mr-2" />
                              Clear Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDeleteChat}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleBlockUser} className="text-destructive">
                              <UserX className="w-4 h-4 mr-2" />
                              Block User
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem onClick={handleUnblockUser}>
                              <UserCheck className="w-4 h-4 mr-2" />
                              Unblock User
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDeleteChat}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Chat
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {isUserBlocked ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <UserX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">User Blocked</h3>
                      <p className="text-muted-foreground mb-4">You have blocked this user. Messages are hidden.</p>
                      <div className="flex gap-2 justify-center">
                        <Button onClick={handleUnblockUser} variant="outline">
                          <UserCheck className="w-4 h-4 mr-2" />
                          Unblock User
                        </Button>
                        <Button onClick={handleDeleteChat} variant="destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      ref={messagesContainerRef}
                      onScroll={handleScroll}
                      className="flex-1 p-6 overflow-y-auto space-y-4"
                    >
                      {filteredMessages && filteredMessages.map((message) => (
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
                      <div ref={messagesEndRef} />
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
                          disabled={isUserBlocked}
                        />
                        <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isUserBlocked}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
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
        <MobileLayout showHeader={false} showNavigation={true}>
          <div className="p-4">
            <h2 className="text-xl font-bold text-foreground mb-4">Messages</h2>
            
            <UserSearch onStartChat={handleUserClick} />
            
            <div className="mt-6 space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Recent Chats</h3>
              {recentChats.map((chat) => (
                <div
                  key={chat.other_user_id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleUserClick(chat.other_user_id)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center relative">
                    <span className="text-sm font-bold text-white">
                      {chat.other_user_name?.charAt(0) || 'U'}
                    </span>
                    {unreadMessages.has(chat.other_user_id) && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{chat.other_user_name}</p>
                    <p className="text-sm text-muted-foreground">{chat.other_user_university}</p>
                  </div>
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
            onClearChat={!isUserBlocked ? handleClearChat : undefined}
            onDeleteChat={handleDeleteChat}
            onBlockUser={!isUserBlocked ? handleBlockUser : undefined}
            onUnblockUser={isUserBlocked ? handleUnblockUser : undefined}
          />
          
          {isUserBlocked ? (
            <div className="flex-1 flex items-center justify-center pt-20 pb-20">
              <div className="text-center">
                <UserX className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">User Blocked</h3>
                <p className="text-muted-foreground mb-4">You have blocked this user. Messages are hidden.</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={handleUnblockUser} variant="outline">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Unblock User
                  </Button>
                  <Button onClick={handleDeleteChat} variant="destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Chat
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 p-4 overflow-y-auto space-y-4 pt-20 pb-20"
              >
                {filteredMessages && filteredMessages.map((message) => (
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
                <div ref={messagesEndRef} />
              </div>

              <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder={isUserBlocked ? "User is blocked" : "Type your message..."}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                    disabled={isUserBlocked}
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isUserBlocked}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
