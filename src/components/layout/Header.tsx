
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useUsers';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { users, loading, searchUsers } = useUsers();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim()) {
      debounceRef.current = setTimeout(() => {
        searchUsers(searchQuery.trim());
        setShowResults(true);
      }, 800);
    } else {
      setShowResults(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUserClick = (user: any) => {
    navigate(`/profile/${user.user_id}`);
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary">Unigramm</h1>
        </div>
        
        <div className="flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-muted text-foreground placeholder:text-muted-foreground focus:border-primary"
            />
          </div>
          
          {showResults && (
            <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg mt-1 shadow-lg z-50 max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Searching users...
                </div>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.full_name?.charAt(0) || user.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{user.full_name || user.username}</p>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        {user.university && <p className="text-xs text-muted-foreground">{user.university}</p>}
                      </div>
                    </div>
                  </div>
                ))
              ) : searchQuery.trim() ? (
                <div className="p-4 text-center text-muted-foreground">No users found</div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
