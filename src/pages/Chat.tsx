
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MoreHorizontal } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';
import UserSearch from '@/components/chat/UserSearch';

export default function Chat() {
  const { user } = useAuth();
  const { conversations, currentMessages, loading, fetchMessages, sendMessage, createConversation } = useChat();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleChatSelect = (conversation: any) => {
    setSelectedChat(conversation);
    fetchMessages(conversation.conversation_id);
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;
    
    await sendMessage(selectedChat.conversation_id, newMessage);
    setNewMessage('');
  };

  const handleStartChat = async (userId: string) => {
    const conversationId = await createConversation(userId);
    if (conversationId) {
      // Find the new conversation and select it
      const newConversation = conversations.find(c => c.conversation_id === conversationId);
      if (newConversation) {
        handleChatSelect(newConversation);
      }
    }
  };

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex bg-card rounded-2xl overflow-hidden border border-border">
        {/* Chat List */}
        <div className="w-1/3 border-r border-border flex flex-col bg-card">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Messages</h2>
            </div>
            <UserSearch onStartChat={handleStartChat} />
          </div>

          {/* Conversations */}
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
              {/* Chat Header */}
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

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                {currentMessages.map((message) => (
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
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 bg-muted/50 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button onClick={handleSendMessage} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Send className="w-4 h-4" />
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
