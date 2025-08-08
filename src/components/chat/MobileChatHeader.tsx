
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal } from 'lucide-react';

interface MobileChatHeaderProps {
  user: any;
  onBack: () => void;
  onUsernameClick: () => void;
}

export default function MobileChatHeader({ user, onBack, onUsernameClick }: MobileChatHeaderProps) {
  const userName = user?.full_name || user?.username || 'Unknown User';
  const userUniversity = user?.university || 'University';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4 flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <div className="flex items-center gap-3 flex-1">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {userName?.charAt(0) || 'U'}
          </span>
        </div>
        <div>
          <p 
            className="font-semibold text-foreground cursor-pointer hover:text-primary"
            onClick={onUsernameClick}
          >
            {userName}
          </p>
          <p className="text-sm text-muted-foreground">{userUniversity}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-muted">
        <MoreHorizontal className="w-5 h-5" />
      </Button>
    </div>
  );
}
