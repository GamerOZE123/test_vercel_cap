
import React, { useEffect, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DetailedJobForm from '@/components/jobs/DetailedJobForm';
import StudentApplicationForm from '@/components/jobs/StudentApplicationForm';

export default function JobsInternships() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userType, setUserType] = useState<'student' | 'company'>('student');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  if (showForm) {
    return (
      <Layout>
        {userType === 'company' ? (
          <DetailedJobForm 
            onComplete={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <StudentApplicationForm 
            onComplete={() => setShowForm(false)}
            onCancel={() => setShowForm(false)}
          />
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/university')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {userType === 'student' ? 'Job & Internship Applications' : 'Post Jobs & Internships'}
          </h1>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="post-card text-center py-12">
            {userType === 'company' ? (
              <>
                <h2 className="text-2xl font-semibold mb-4">Post Your Next Opportunity</h2>
                <p className="text-muted-foreground mb-8">
                  Create detailed job postings to attract the best candidates. Include all the information 
                  students need to understand the role and apply confidently.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-left">
                    <h3 className="font-semibold mb-2">📋 Detailed Job Info</h3>
                    <p className="text-sm text-muted-foreground">
                      Include comprehensive job descriptions, requirements, and company culture
                    </p>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-2">💰 Compensation & Benefits</h3>
                    <p className="text-sm text-muted-foreground">
                      Be transparent about salary ranges and benefits to attract quality candidates
                    </p>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-2">🎯 Targeted Matching</h3>
                    <p className="text-sm text-muted-foreground">
                      Specify skills and experience levels to reach the right candidates
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowForm(true)} size="lg">
                  Create Job Posting
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-4">Build Your Professional Profile</h2>
                <p className="text-muted-foreground mb-8">
                  Create a comprehensive profile that showcases your skills, experience, and career goals. 
                  Stand out to employers with a LinkedIn-style professional profile.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-left">
                    <h3 className="font-semibold mb-2">👤 Personal Branding</h3>
                    <p className="text-sm text-muted-foreground">
                      Craft a compelling professional summary and showcase your unique value
                    </p>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-2">🎓 Education & Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Detail your academic background, work experience, and projects
                    </p>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold mb-2">🔗 Online Presence</h3>
                    <p className="text-sm text-muted-foreground">
                      Link your LinkedIn, GitHub, portfolio, and other professional profiles
                    </p>
                  </div>
                </div>
                <Button onClick={() => setShowForm(true)} size="lg">
                  Complete Your Profile
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
