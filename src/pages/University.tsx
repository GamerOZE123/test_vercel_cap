
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar, Users, BookOpen, Trophy, ShoppingBag, Gavel, PartyPopper, UsersIcon } from 'lucide-react';
import BuySellPage from '@/components/university/BuySellPage';
import AuctionPage from '@/components/university/AuctionPage';
import HolidayPage from '@/components/university/HolidayPage';
import ClubsPage from '@/components/university/ClubsPage';

const departments = [
  { name: 'Computer Science', students: 1250, posts: 456 },
  { name: 'Engineering', students: 980, posts: 312 },
  { name: 'Business', students: 890, posts: 287 },
  { name: 'Design', students: 670, posts: 234 },
  { name: 'Physics', students: 540, posts: 189 },
];

const navigationSections = [
  { id: 'overview', name: 'Overview', icon: GraduationCap },
  { id: 'buysell', name: 'Buy/Sell', icon: ShoppingBag },
  { id: 'auction', name: 'Auction', icon: Gavel },
  { id: 'holiday', name: 'Holiday', icon: PartyPopper },
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
      case 'holiday':
        return <HolidayPage />;
      case 'clubs':
        return <ClubsPage />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* University Header */}
      <div className="post-card">
        <div className="relative">
          <div className="h-32 md:h-40 university-gradient rounded-xl mb-6 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <GraduationCap className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-2 md:mb-4" />
              <h1 className="text-xl md:text-3xl font-bold">Massachusetts Institute of Technology</h1>
              <p className="text-sm md:text-lg opacity-90 mt-1 md:mt-2">Mens et Manus</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-foreground">11,276</p>
              <p className="text-xs md:text-sm text-muted-foreground">Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-foreground">5</p>
              <p className="text-xs md:text-sm text-muted-foreground">Schools</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-foreground">95</p>
              <p className="text-xs md:text-sm text-muted-foreground">Nobel Prizes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <p className="text-lg md:text-2xl font-bold text-foreground">1861</p>
              <p className="text-xs md:text-sm text-muted-foreground">Founded</p>
            </div>
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
                className="bg-surface hover:bg-surface-hover transition-colors rounded-xl p-4 md:p-6 cursor-pointer group"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-xl mx-auto mb-3 group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  </div>
                  <h3 className="text-sm md:text-base font-semibold text-foreground">{section.name}</h3>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular Departments */}
      <div className="post-card">
        <h2 className="text-lg md:text-xl font-bold text-foreground mb-4">Popular Departments</h2>
        <div className="space-y-3">
          {departments.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-xl hover:bg-surface-hover transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm md:text-base font-semibold text-foreground">{dept.name}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">{dept.students} students • {dept.posts} posts</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="btn-ghost text-xs md:text-sm">
                Join
              </Button>
            </div>
          ))}
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
