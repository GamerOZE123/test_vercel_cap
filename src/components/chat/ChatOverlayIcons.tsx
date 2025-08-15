
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';

export default function ChatOverlayIcons() {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const isMobile = useIsMobile();

  // Only show on mobile
  if (!isMobile) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigate('/explore')}
        className="shadow-lg bg-card/90 backdrop-blur-sm"
      >
        <Search className="h-5 w-5" />
      </Button>
      
      <Button
        variant="secondary"
        size="icon"
        onClick={() => navigate('/notifications')}
        className="shadow-lg bg-card/90 backdrop-blur-sm relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{unreadCount > 9 ? '9+' : unreadCount}</span>
          </div>
        )}
      </Button>
    </div>
  );
}
