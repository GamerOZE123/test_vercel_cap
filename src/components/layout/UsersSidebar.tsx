
import React from 'react';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, UserPlus } from 'lucide-react';

const suggestedUsers = [
  { id: 1, name: 'Sarah Johnson', university: 'Computer Science', avatar: 'SJ', mutual: 5 },
  { id: 2, name: 'Mike Chen', university: 'Engineering', avatar: 'MC', mutual: 3 },
  { id: 3, name: 'Emily Davis', university: 'Business', avatar: 'ED', mutual: 8 },
  { id: 4, name: 'Alex Rivera', university: 'Design', avatar: 'AR', mutual: 2 },
  { id: 5, name: 'Jordan Smith', university: 'Physics', avatar: 'JS', mutual: 6 },
];

const activeUsers = [
  { id: 1, name: 'Lisa Wang', avatar: 'LW', online: true },
  { id: 2, name: 'Tom Brown', avatar: 'TB', online: true },
  { id: 3, name: 'Anna Lee', avatar: 'AL', online: false },
  { id: 4, name: 'David Kim', avatar: 'DK', online: true },
];

export default function UsersSidebar() {
  return (
    <aside className="hidden xl:block fixed top-16 right-0 w-80 h-[calc(100vh-4rem)] overflow-y-auto bg-card border-l border-border p-6">
      {/* Suggested for You */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Suggested for You</h3>
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
            See All
          </Button>
        </div>
        <div className="space-y-3">
          {suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{user.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.university}</p>
                  <p className="text-xs text-muted-foreground">{user.mutual} mutual connections</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="btn-ghost">
                <UserPlus className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Active Now */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Active Now</h3>
          <Button variant="ghost" size="icon" className="btn-ghost">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {activeUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-3 cursor-pointer hover:bg-surface rounded-lg p-2 transition-colors">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{user.avatar}</span>
                </div>
                {user.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-card rounded-full"></div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.online ? 'Active now' : 'Active 2h ago'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
