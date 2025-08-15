
import React from 'react';
import MobileNavigation from './MobileNavigation';
import MobileHeader from './MobileHeader';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <MobileHeader />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <MobileNavigation />
    </div>
  );
}
