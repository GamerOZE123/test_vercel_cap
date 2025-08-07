
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import UsersSidebar from './UsersSidebar';
import MobileNavigation from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header />
      <UsersSidebar />
      <MobileNavigation />
      
      {/* Main Content */}
      <main className="pt-16 md:pl-64 xl:pr-80 pb-16 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
