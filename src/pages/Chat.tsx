
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, MoreHorizontal, Send } from 'lucide-react';

const conversations = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'SJ',
    university: 'Computer Science',
    lastMessage: 'Hey! How did your presentation go?',
    timestamp: '2m',
    unread: 2,
    online: true
  },
  {
    id: 2,
    name: 'Study Group',
    avatar: 'SG',
    university: 'Group Chat',
    lastMessage: 'Mike: Don\'t forget about tomorrow\'s meeting',
    timestamp: '1h',
    unread: 0,
    online: false
  },
  {
    id: 3,
    name: 'Alex Rivera',
    avatar: 'AR',
    university: 'Design',
    lastMessage: 'Thanks for the feedback on my project!',
    timestamp: '3h',
    unread: 0,
    online: true
  }
];

const messages = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    content: 'Hey! How did your presentation go?',
    timestamp: '2:34 PM',
    isMe: false
  },
  {
    id: 2,
    sender: 'You',
    content: 'It went really well! The professor was impressed with the results.',
    timestamp: '2:35 PM',
    isMe: true
  },
  {
    id: 3,
    sender: 'Sarah Johnson',
    content: 'That\'s awesome! I knew you\'d nail it 🎉',
    timestamp: '2:36 PM',
    isMe: false
  },
  {
    id: 4,
    sender: 'You',
    content: 'Thanks! How\'s your machine learning project coming along?',
    timestamp: '2:37 PM',
    isMe: true
  }
];

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');

  return (
    <Layout>
      <div className="h-[calc(100vh-8rem)] flex bg-card rounded-2xl overflow-hidden">
        {/* Chat List */}
        <div className="w-1/3 border-r border-border flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">Messages</h2>
              <Button variant="ghost" size="icon" className="btn-ghost">
                <Plus className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-10 bg-surface border-border"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map((chat) => (
              <div
                key={chat.id}
                className={`p-4 border-b border-border cursor-pointer transition-colors ${
                  selectedChat.id === chat.id ? 'bg-surface' : 'hover:bg-surface/50'
                }`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{chat.avatar}</span>
                    </div>
                    {chat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-card rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-foreground truncate">{chat.name}</p>
                      <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.university}</p>
                    <p className="text-sm text-muted-foreground truncate mt-1">{chat.lastMessage}</p>
                  </div>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{chat.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-white">{selectedChat.avatar}</span>
              </div>
              <div>
                <p className="font-semibold text-foreground">{selectedChat.name}</p>
                <p className="text-sm text-muted-foreground">{selectedChat.university}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="btn-ghost">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  message.isMe 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-surface text-foreground'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 bg-surface border-border"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    // Handle send message
                    setNewMessage('');
                  }
                }}
              />
              <Button className="btn-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
