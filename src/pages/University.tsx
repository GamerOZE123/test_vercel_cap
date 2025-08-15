import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { GraduationCap, Gavel, ShoppingBag, Calendar, Users, Briefcase, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export default function University() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'student' | 'company'>('student');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        if (data) {
          setUserType(data.user_type || 'student');
        }
      } catch (error) {
        console.error('Error fetching user type:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserType();
  }, [user]);

  const studentActions = [
    {
      name: 'Auctions',
      description: 'Bid on items from fellow students',
      icon: Gavel,
      path: '/auction',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'Buy & Sell',
      description: 'Browse marketplace items',
      icon: ShoppingBag,
      path: '/buy-sell',
      color: 'from-green-500 to-green-600'
    },
    {
      name: 'Jobs & Internships',
      description: 'Find your dream job or internship',
      icon: Briefcase,
      path: '/jobs',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Holidays',
      description: 'Campus holiday events',
      icon: Calendar,
      path: '/holidays',
      color: 'from-red-500 to-red-600'
    },
    {
      name: 'Clubs',
      description: 'Join student organizations',
      icon: Users,
      path: '/clubs',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const companyActions = [
    {
      name: 'Jobs & Internships',
      description: 'Post jobs and find talented students',
      icon: Briefcase,
      path: '/jobs',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Advertising',
      description: 'Promote your company to students',
      icon: TrendingUp,
      path: '/advertising',
      color: 'from-green-500 to-green-600'
    }
  ];

  const quickActions = userType === 'student' ? studentActions : companyActions;

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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

        {/* Quick Access */}
        <div className="post-card">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            {userType === 'student' ? 'Quick Access' : 'Company Dashboard'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.name}
                variant="outline"
                className="h-auto p-4 justify-start hover:shadow-md transition-shadow"
                onClick={() => navigate(action.path)}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mr-4 flex-shrink-0`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-foreground">{action.name}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
