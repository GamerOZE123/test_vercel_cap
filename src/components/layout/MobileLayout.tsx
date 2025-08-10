
import React from 'react';
import MobileNavigation from './MobileNavigation';
import { Bell } from 'lucide-react';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showHeader?: boolean;
}

export default function MobileLayout({ 
  children, 
  showNavigation = true, 
  showHeader = true 
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background md:hidden">
      {showHeader && (
        <div className="fixed top-0 left-0 right-0 z-40 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Campus Connect</h1>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-muted transition-colors">
                <Bell className="w-5 h-5 text-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className={`${showHeader ? 'pt-16' : ''} ${showNavigation ? 'pb-16' : ''} min-h-screen`}>
        {children}
      </main>
      
      {showNavigation && <MobileNavigation />}
    </div>
  );
}
