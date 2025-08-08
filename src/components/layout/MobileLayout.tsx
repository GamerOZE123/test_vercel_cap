
import React from 'react';
import MobileNavigation from './MobileNavigation';

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
        <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Campus Connect</h1>
            <div className="flex items-center gap-2">
              {/* Notification icon - you can replace with actual notification functionality */}
              <button className="p-2 rounded-full hover:bg-muted">
                <div className="w-5 h-5 bg-primary rounded-full"></div>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className={`${showHeader ? 'pt-20' : ''} ${showNavigation ? 'pb-20' : ''}`}>
        {children}
      </main>
      
      {showNavigation && <MobileNavigation />}
    </div>
  );
}
