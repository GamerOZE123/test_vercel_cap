
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Search Header */}
        <div className="post-card">
          <h2 className="text-2xl font-bold text-foreground mb-4">Explore</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts, people, clubs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            <Button variant="outline" size="sm" className="sm:w-auto w-full">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Content placeholder */}
        <div className="post-card text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery ? `No results found for "${searchQuery}"` : 'Start searching to discover content'}
          </p>
        </div>
      </div>
    </Layout>
  );
}
