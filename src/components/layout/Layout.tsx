
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
  const isFitnessPage = location.pathname === '/fitness';

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar - hidden on fitness page */}
      {!isFitnessPage && <Sidebar />}
      
      {/* Header - hidden on mobile and fitness page */}
      {!isFitnessPage && <Header />}
      
      {/* Main Content */}
      <main className={`${!isFitnessPage ? 'md:ml-64 md:pt-16' : ''} ${!isFitnessPage ? 'pb-20 md:pb-6' : ''} ${showUsersSidebar && !isFitnessPage ? 'xl:mr-80' : ''}`}>
        {!isFitnessPage && (
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        )}
        {isFitnessPage && children}
      </main>
      
      {/* Users Sidebar - only on home page */}
      {showUsersSidebar && !isFitnessPage && <UsersSidebar />}
      
      {/* Mobile Navigation - hidden on fitness page */}
      {!isFitnessPage && <MobileNavigation />}
    </div>
  );
}
