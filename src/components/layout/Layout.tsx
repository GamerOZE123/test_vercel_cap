
import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileNavigation from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <main className="md:ml-64 pt-16 pb-20 md:pb-6">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
}
