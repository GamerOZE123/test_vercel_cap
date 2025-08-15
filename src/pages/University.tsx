
import React from 'react';
import Layout from '@/components/layout/Layout';
import { GraduationCap } from 'lucide-react';

export default function University() {
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
      </div>
    </Layout>
  );
}
