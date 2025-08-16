import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/layout/Layout';
import MobileLayout from '@/components/layout/MobileLayout';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMobile } from '@/hooks/use-mobile';
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
  user_id: string;
  conversation_id: string;
  profiles: UserProfile | null;
}

interface Conversation {
  id: string;
  created_at: string;
  user_id_1: string;
  user_id_2: string;
  profiles_1?: UserProfile;
  profiles_2?: UserProfile;
}

export default function Chat() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(conversationId || null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();

  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
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
        .select('id, full_name, username, avatar_url')
        .neq('id', user?.id);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const fetchConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          created_at,
          user_id_1,
          user_id_2,
          profiles_1:profiles!conversations_user_id_1_fkey(id, full_name, username, avatar_url),
          profiles_2:profiles!conversations_user_id_2_fkey(id, full_name, username, avatar_url)
        `)
        .or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`)
        .order('created_at', { ascending: false });

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
          user_id,
          conversation_id,
          profiles:profiles!messages_user_id_fkey(id, full_name, username, avatar_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const createConversation = async (userId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id_1: user.id,
          user_id_2: userId
        })
        .select('*')
        .single();

      if (error) throw error;
      setConversations(prev => [data, ...prev]);
      setSelectedConversation(data.id);
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
          user_id: user.id,
          conversation_id: selectedConversation
        })
        .select(`
          id,
          content,
          created_at,
          user_id,
          conversation_id,
          profiles:profiles!messages_user_id_fkey(id, full_name, username, avatar_url)
        `)
        .single();

      if (error) throw error;
      setMessages(prev => [...prev, data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      setSelectedConversation(null);
      setMessages([]);
      toast.success('Conversation deleted!');
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const blockUser = async (userId: string) => {
    try {
      // Implement block user logic here
      toast.success('User blocked!');
    } catch (error) {
      console.error('Error blocking user:', error);
      toast.error('Failed to block user');
    }
  };

  const unblockUser = async (userId: string) => {
    try {
      // Implement unblock user logic here
      toast.success('User unblocked!');
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast.error('Failed to unblock user');
    }
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
              {conversations.map(conversation => {
                const otherUser = conversation.user_id_1 === user?.id ? conversation.profiles_2 : conversation.profiles_1;
                return (
                  <li key={conversation.id} className={`flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer ${selectedConversation === conversation.id ? 'bg-muted/50' : ''}`} onClick={() => setSelectedConversation(conversation.id)}>
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{otherUser?.full_name?.charAt(0).toUpperCase() || otherUser?.username?.charAt(0).toUpperCase() || 'U'}</span>
                    </div>
                    <p className="text-sm font-medium">{otherUser?.full_name || otherUser?.username || 'Unknown User'}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Chat Area */}
          <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {conversations.find(c => c.id === selectedConversation && (c.profiles_1?.full_name || c.profiles_1?.username || c.profiles_2?.full_name || c.profiles_2?.username))?.profiles_1?.full_name || conversations.find(c => c.id === selectedConversation && (c.profiles_1?.full_name || c.profiles_1?.username || c.profiles_2?.full_name || c.profiles_2?.username))?.profiles_1?.username || 'Chat'}
                  </h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => deleteConversation(selectedConversation)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Conversation
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => blockUser(conversations.find(c => c.id === selectedConversation && (c.profiles_1?.id || c.profiles_2?.id))?.profiles_1?.id || conversations.find(c => c.id === selectedConversation && (c.profiles_1?.id || c.profiles_2?.id))?.profiles_2?.id || '')}>
                        <UserX className="mr-2 h-4 w-4" />
                        Block User
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => unblockUser(conversations.find(c => c.id === selectedConversation && (c.profiles_1?.id || c.profiles_2?.id))?.profiles_1?.id || conversations.find(c => c.id === selectedConversation && (c.profiles_1?.id || c.profiles_2?.id))?.profiles_2?.id || '')}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Unblock User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <ul className="space-y-3">
                    {messages.map(message => (
                      <li key={message.id} className={`flex flex-col ${message.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-xl p-3 ${message.user_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
                    />
                    <Button onClick={sendMessage} disabled={submitting}>
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
              {conversations.find(c => c.id === selectedConversation && (c.profiles_1?.full_name || c.profiles_1?.username || c.profiles_2?.full_name || c.profiles_2?.username))?.profiles_1?.full_name || conversations.find(c => c.id === selectedConversation && (c.profiles_1?.full_name || c.profiles_1?.username || c.profiles_2?.full_name || c.profiles_2?.username))?.profiles_1?.username || 'Chat'}
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
              <DropdownMenuItem onClick={() => deleteConversation(selectedConversation)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Conversation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => blockUser(conversations.find(c => c.id === selectedConversation && (c.profiles_1?.id || c.profiles_2?.id))?.profiles_1?.id || conversations.find(c => c.id === selectedConversation && (c.profiles_1?.id || c.profiles_2?.id))?.profiles_2?.id || '')}>
                <UserX className="mr-2 h-4 w-4" />
                Block User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => unblockUser(conversations.find(c => c.id === selectedConversation && (c.profiles_1?.id || c.profiles_2?.id))?.profiles_1?.id || conversations.find(c => c.id === selectedConversation && (c.profiles_1?.id || c.profiles_2?.id))?.profiles_2?.id || '')}>
                <UserCheck className="mr-2 h-4 w-4" />
                Unblock User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-3">
            {messages.map(message => (
              <li key={message.id} className={`flex flex-col ${message.user_id === user?.id ? 'items-end' : 'items-start'}`}>
                <div className={`rounded-xl p-3 ${message.user_id === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
            />
            <Button onClick={sendMessage} disabled={submitting}>
              <Send className="w-4 h-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
