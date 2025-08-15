
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import UsersSidebar from './UsersSidebar';
import MobileNavigation from './MobileNavigation';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const showUsersSidebar = location.pathname === '/';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Header - hidden on mobile */}
      <Header />
      
      {/* Main Content */}
      <main className={`md:ml-64 md:pt-16 pb-20 md:pb-6 ${showUsersSidebar ? 'xl:mr-80' : ''}`}>
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Users Sidebar - only on home page */}
      {showUsersSidebar && <UsersSidebar />}
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
