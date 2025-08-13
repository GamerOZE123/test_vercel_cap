
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
          <div className="h-40 university-gradient rounded-xl mb-6 flex items-center justify-center">
            <div className="text-center text-white">
              <GraduationCap className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Massachusetts Institute of Technology</h1>
              <p className="text-lg opacity-90 mt-2">Mens et Manus</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">11,276</p>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">5</p>
              <p className="text-sm text-muted-foreground">Schools</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">95</p>
              <p className="text-sm text-muted-foreground">Nobel Prizes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-2">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">1861</p>
              <p className="text-sm text-muted-foreground">Founded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Departments */}
      <div className="post-card">
        <h2 className="text-xl font-bold text-foreground mb-4">Popular Departments</h2>
        <div className="space-y-3">
          {departments.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-surface rounded-xl hover:bg-surface-hover transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{dept.name}</p>
                  <p className="text-sm text-muted-foreground">{dept.students} students • {dept.posts} posts</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="btn-ghost">
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
      <div className="space-y-6">
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
                  className="flex items-center gap-2"
                >
                  <IconComponent className="w-4 h-4" />
                  {section.name}
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
