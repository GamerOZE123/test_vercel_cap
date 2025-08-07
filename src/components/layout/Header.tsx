
import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Mobile Logo */}
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-8 h-8 university-gradient rounded-xl flex items-center justify-center">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Unigramm
          </span>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search universities, students..." 
              className="pl-10 bg-surface border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search */}
          <Button variant="ghost" size="icon" className="btn-ghost md:hidden">
            <Search className="w-5 h-5" />
          </Button>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="btn-ghost relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
