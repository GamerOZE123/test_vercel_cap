
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';

export default function ChatOverlayIcons() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/explore')}
        className="p-3 bg-card/90 backdrop-blur hover:bg-muted shadow-lg"
      >
        <Search className="h-5 w-5" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/notifications')}
        className="p-3 bg-card/90 backdrop-blur hover:bg-muted shadow-lg relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{unreadCount}</span>
          </div>
        )}
      </Button>
    </div>
  );
}
