
import React, { useState, useRef, useEffect } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useUsers';
import { useNavigate } from 'react-router-dom';

interface UserSearchProps {
  onStartChat: (userId: string) => void;
}

export default function UserSearch({ onStartChat }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { users, loading, searchUsers } = useUsers();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout
    debounceRef.current = setTimeout(() => {
      if (query.trim()) {
        searchUsers(query.trim());
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 500); // Increased debounce time to reduce glitching

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchUsers]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = (user: any, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${user.user_id}`);
    setShowResults(false);
    setQuery('');
  };

  const handleStartChat = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onStartChat(userId);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input 
          placeholder="Search users to chat with..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-muted/50 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary"
        />
      </div>
      
      {showResults && (
        <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              Searching...
            </div>
          ) : users.length > 0 ? (
            users.map((user) => (
              <div
                key={user.id}
                className="p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1"
                    onClick={(e) => handleUserClick(user, e)}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{user.full_name || user.username}</p>
                      <p className="text-sm text-muted-foreground">{user.university || 'University'}</p>
                      {user.major && <p className="text-xs text-muted-foreground">{user.major}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleStartChat(user.user_id, e)}
                    className="ml-2 hover:bg-primary/10"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : query.trim() ? (
            <div className="p-4 text-center text-muted-foreground">No users found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
