
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Search, User } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useNavigate } from 'react-router-dom';
import TrendingHashtags from '@/components/explore/TrendingHashtags';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const { users, loading, searchUsers } = useUsers();
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Search Header */}
        <div className="post-card">
          <h2 className="text-2xl font-bold text-foreground mb-4">Explore</h2>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        </div>

        {/* Trending Hashtags */}
        {!searchQuery && <TrendingHashtags />}

        {/* Search Results */}
        {searchQuery && (
          <div className="post-card">
            <h3 className="text-lg font-semibold text-foreground mb-4">Users</h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.user_id}
                    onClick={() => handleUserClick(user.user_id)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">
                        {user.full_name || user.username}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                      {user.university && (
                        <p className="text-xs text-muted-foreground truncate">
                          {user.university}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No users found for "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {/* Content placeholder when no search */}
        {!searchQuery && (
          <div className="post-card text-center py-12">
            <p className="text-muted-foreground">Start searching to discover users and content</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
