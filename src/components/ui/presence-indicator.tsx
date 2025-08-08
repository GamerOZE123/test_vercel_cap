
import React from 'react';
import { cn } from '@/lib/utils';

interface PresenceIndicatorProps {
  isOnline: boolean;
  hasUnread?: boolean;
  className?: string;
}

export const PresenceIndicator = ({ isOnline, hasUnread = false, className }: PresenceIndicatorProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Online status indicator */}
      {isOnline && (
        <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
      )}
      
      {/* Unread messages indicator */}
      {hasUnread && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-background" />
      )}
    </div>
  );
};
