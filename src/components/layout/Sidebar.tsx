
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Search, 
  MessageCircle, 
  Bell, 
  User, 
  Briefcase,
  GraduationCap
} from 'lucide-react';

const navigationItems = [
  { icon: Home, label: 'Home', href: '/home' },
  { icon: Search, label: 'Explore', href: '/explore' },
  { icon: GraduationCap, label: 'University', href: '/university' },
  { icon: MessageCircle, label: 'Chat', href: '/chat' },
  { icon: Bell, label: 'Notifications', href: '/notifications' },
  { icon: Briefcase, label: 'Jobs', href: '/jobs' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="hidden lg:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary">UniConnect</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
