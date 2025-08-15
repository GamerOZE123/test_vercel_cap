
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { GraduationCap, ShoppingBag, Gavel, PartyPopper, UsersIcon } from 'lucide-react';
import BuySellPage from '@/components/university/BuySellPage';
import AuctionPage from '@/components/university/AuctionPage';
import HolidayPage from '@/components/university/HolidayPage';
import ClubsPage from '@/components/university/ClubsPage';

const navigationSections = [
  { id: 'overview', name: 'Overview', icon: GraduationCap },
  { id: 'buysell', name: 'Buy & Sell', icon: ShoppingBag },
  { id: 'auction', name: 'Auction', icon: Gavel },
  { id: 'holidays', name: 'Holidays', icon: PartyPopper },
  { id: 'clubs', name: 'Clubs', icon: UsersIcon },
];

export default function University() {
  const [activeSection, setActiveSection] = useState('overview');

  const renderContent = () => {
    switch (activeSection) {
      case 'buysell':
        return <BuySellPage />;
      case 'auction':
        return <AuctionPage />;
      case 'holidays':
        return <HolidayPage />;
      case 'clubs':
        return <ClubsPage />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-4 md:space-y-6">
      {/* University Details */}
      <div className="post-card">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">Stanford University</h1>
            <p className="text-sm md:text-base text-muted-foreground">California, USA • Founded 1885</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-lg md:text-xl font-bold text-primary">15,845</p>
            <p className="text-xs md:text-sm text-muted-foreground">Students</p>
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-primary">2,180</p>
            <p className="text-xs md:text-sm text-muted-foreground">Faculty</p>
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-primary">7</p>
            <p className="text-xs md:text-sm text-muted-foreground">Schools</p>
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-primary">83</p>
            <p className="text-xs md:text-sm text-muted-foreground">Majors</p>
          </div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div className="post-card">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {navigationSections.slice(1).map((section) => {
            const IconComponent = section.icon;
            return (
              <div
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-4 md:p-6 cursor-pointer hover:from-primary/20 hover:to-accent/20 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconComponent className="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base text-foreground">{section.name}</h3>
                  <p className="text-xs text-muted-foreground hidden md:block">
                    {section.id === 'buysell' && 'Buy and sell items'}
                    {section.id === 'auction' && 'Bid on items'}
                    {section.id === 'holidays' && 'Holiday events'}
                    {section.id === 'clubs' && 'Join communities'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Navigation Tabs */}
        <div className="post-card">
          <div className="flex flex-wrap gap-2">
            {navigationSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Button
                  key={section.id}
                  variant={activeSection === section.id ? "default" : "outline"}
                  onClick={() => setActiveSection(section.id)}
                  className="flex items-center gap-2 text-xs md:text-sm"
                  size="sm"
                >
                  <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="hidden sm:inline">{section.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {renderContent()}
      </div>
    </Layout>
  );
}
