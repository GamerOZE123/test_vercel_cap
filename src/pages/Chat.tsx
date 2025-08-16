import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import MobileLayout from '@/components/layout/MobileLayout';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { ArrowLeft, Send, MoreVertical, Trash2, UserX, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  online?: boolean;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  conversation_id: string;
  profiles: UserProfile | null;
}

interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
}

export default function Chat() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId || null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchConversations();
      fetchBlockedUsers();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
      // Mark messages as read when viewing conversation
      setUnreadMessages(prev => ({
        ...prev,
        [selectedConversation]: false
      }));
    } else {
      setMessages([]);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url, user_id')
        .neq('user_id', user?.id);

      if (error) throw error;
      
      // Transform the data to match the expected interface
      const transformedUsers = (data || []).map(profile => ({
        id: profile.user_id,
        full_name: profile.full_name || '',
        username: profile.username || '',
        avatar_url: profile.avatar_url
      }));
      
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchBlockedUsers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('blocked_users')
        .select('blocked_id')
        .eq('blocker_id', user.id);

      if (error) throw error;
      setBlockedUsers((data || []).map(block => block.blocked_id));
    } catch (error) {
      console.error('Error fetching blocked users:', error);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      // Use the existing function to get user conversations
      const { data, error } = await supabase
        .rpc('get_user_conversations', { target_user_id: user.id });

      if (error) throw error;
      setConversations(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          conversation_id,
          profiles:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url, user_id)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match the expected interface
      const transformedMessages = (data || []).map(message => ({
        ...message,
        profiles: message.profiles ? {
          id: message.profiles.user_id,
          full_name: message.profiles.full_name || '',
          username: message.profiles.username || '',
          avatar_url: message.profiles.avatar_url
        } : null
      }));
      
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const createConversation = async (userId: string) => {
    if (!user) return;

    try {
      // Use the existing function to get or create conversation
      const { data, error } = await supabase
        .rpc('get_or_create_conversation', { 
          user1_id: user.id, 
          user2_id: userId 
        });

      if (error) throw error;
      
      setSelectedConversation(data);
      // Refresh conversations to show the new one
      fetchConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim() || submitting) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          sender_id: user.id,
          conversation_id: selectedConversation
        })
        .select(`
          id,
          content,
          created_at,
          sender_id,
          conversation_id,
          profiles:profiles!messages_sender_id_fkey(id, full_name, username, avatar_url, user_id)
        `)
        .single();

      if (error) throw error;
      
      // Transform the data to match the expected interface
      const transformedMessage = {
        ...data,
        profiles: data.profiles ? {
          id: data.profiles.user_id,
          full_name: data.profiles.full_name || '',
          username: data.profiles.username || '',
          avatar_url: data.profiles.avatar_url
        } : null
      };
      
      setMessages(prev => [...prev, transformedMessage]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const clearChat = async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (error) throw error;
      
      if (selectedConversation === conversationId) {
        setMessages([]);
      }
      toast.success('Chat cleared!');
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast.error('Failed to clear chat');
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
      setSelectedConversation(null);
      setMessages([]);
      toast.success('Conversation deleted!');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const blockUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: userId
        });

      if (error) throw error;
      
      setBlockedUsers(prev => [...prev, userId]);
      toast.success('User blocked!');
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const unblockUser = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (error) throw error;
      
      setBlockedUsers(prev => prev.filter(id => id !== userId));
      toast.success('User unblocked!');
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
  };

  const getCurrentConversation = () => {
    return conversations.find(c => c.conversation_id === selectedConversation);
  };

  const getOtherUserId = (conversation: any) => {
    return conversation?.other_user_id;
  };

  const isUserBlocked = (userId: string) => {
    return blockedUsers.includes(userId);
  };

  // Desktop Layout
  if (!isMobile) {
    return (
      <Layout>
        <div className="h-[calc(100vh-6rem)] flex gap-6">
          {/* User List */}
          <div className="w-1/3 bg-card border border-border rounded-2xl p-6">
            <h2 className="text-lg font-semibold mb-4">Users</h2>
            <ul className="space-y-2">
              {users.map(userProfile => (
                <li key={userProfile.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => createConversation(userProfile.id)}>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">{userProfile.full_name?.charAt(0).toUpperCase() || userProfile.username?.charAt(0).toUpperCase() || 'U'}</span>
                  </div>
                  <p className="text-sm font-medium">{userProfile.full_name || userProfile.username}</p>
                </li>
              ))}
            </ul>
            <h2 className="text-lg font-semibold mt-6 mb-4">Conversations</h2>
            <ul className="space-y-2">
              {conversations.map(conversation => (
                <li key={conversation.conversation_id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer relative ${selectedConversation === conversation.conversation_id ? 'bg-muted/50' : ''}`} onClick={() => setSelectedConversation(conversation.conversation_id)}>
                  <div className="relative">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{conversation.other_user_name?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    {unreadMessages[conversation.conversation_id] && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{conversation.other_user_name || 'Unknown User'}</p>
                    {conversation.last_message && (
                      <p className="text-xs text-muted-foreground truncate">{conversation.last_message}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {getCurrentConversation()?.other_user_name || 'Chat'}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => clearChat(selectedConversation)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear Chat
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteConversation(selectedConversation)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Conversation
                      </DropdownMenuItem>
                      {getOtherUserId(getCurrentConversation()) && (
                        <>
                          {isUserBlocked(getOtherUserId(getCurrentConversation())) ? (
                            <DropdownMenuItem onClick={() => unblockUser(getOtherUserId(getCurrentConversation()))}>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Unblock User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => blockUser(getOtherUserId(getCurrentConversation()))}>
                              <UserX className="mr-2 h-4 w-4" />
                              Block User
                            </DropdownMenuItem>
                          )}
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {getOtherUserId(getCurrentConversation()) && isUserBlocked(getOtherUserId(getCurrentConversation())) && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                      <p className="text-sm">You have blocked this user. You won't receive new messages from them.</p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => unblockUser(getOtherUserId(getCurrentConversation()))}>
                          Unblock User
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteConversation(selectedConversation)}>
                          Delete Chat
                        </Button>
                      </div>
                    </div>
                  )}
                  <ul className="space-y-3">
                    {messages.map(message => (
                      <li key={message.id} className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-xl p-3 ${message.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">{new Date(message.created_at).toLocaleTimeString()}</span>
                      </li>
                    ))}
                    <div ref={messagesEndRef} />
                  </ul>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                      disabled={getOtherUserId(getCurrentConversation()) && isUserBlocked(getOtherUserId(getCurrentConversation()))}
                    />
                    <Button onClick={sendMessage} disabled={submitting || (getOtherUserId(getCurrentConversation()) && isUserBlocked(getOtherUserId(getCurrentConversation())))}>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-muted-foreground">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <MobileLayout>
      <div className="h-[calc(100vh-9rem)] flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <ArrowLeft className="w-5 h-5 cursor-pointer" onClick={() => window.history.back()} />
            <h3 className="text-lg font-semibold">
              {getCurrentConversation()?.other_user_name || 'Chat'}
            </h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => clearChat(selectedConversation || '')}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Chat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => deleteConversation(selectedConversation || '')}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Conversation
              </DropdownMenuItem>
              {getOtherUserId(getCurrentConversation()) && (
                <>
                  {isUserBlocked(getOtherUserId(getCurrentConversation())) ? (
                    <DropdownMenuItem onClick={() => unblockUser(getOtherUserId(getCurrentConversation()))}>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Unblock User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => blockUser(getOtherUserId(getCurrentConversation()))}>
                      <UserX className="mr-2 h-4 w-4" />
                      Block User
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          {getOtherUserId(getCurrentConversation()) && isUserBlocked(getOtherUserId(getCurrentConversation())) && (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="text-sm">You have blocked this user. You won't receive new messages from them.</p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => unblockUser(getOtherUserId(getCurrentConversation()))}>
                  Unblock User
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteConversation(selectedConversation || '')}>
                  Delete Chat
                </Button>
              </div>
            </div>
          )}
          <ul className="space-y-3">
            {messages.map(message => (
              <li key={message.id} className={`flex flex-col ${message.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-xl p-3 ${message.sender_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm">{message.content}</p>
                </div>
                <span className="text-xs text-muted-foreground mt-1">{new Date(message.created_at).toLocaleTimeString()}</span>
              </li>
            ))}
            <div ref={messagesEndRef} />
          </ul>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  sendMessage();
                }
              }}
              disabled={getOtherUserId(getCurrentConversation()) && isUserBlocked(getOtherUserId(getCurrentConversation()))}
            />
            <Button onClick={sendMessage} disabled={submitting || (getOtherUserId(getCurrentConversation()) && isUserBlocked(getOtherUserId(getCurrentConversation())))}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
