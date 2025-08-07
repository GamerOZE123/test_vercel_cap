
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { GraduationCap, Calendar, Users, BookOpen, Trophy } from 'lucide-react';

const departments = [
  { name: 'Computer Science', students: 1250, posts: 456 },
  { name: 'Engineering', students: 980, posts: 312 },
  { name: 'Business', students: 890, posts: 287 },
  { name: 'Design', students: 670, posts: 234 },
  { name: 'Physics', students: 540, posts: 189 },
];

const events = [
  {
    id: 1,
    title: 'Tech Career Fair',
    date: 'March 15, 2024',
    time: '10:00 AM - 4:00 PM',
    location: 'Student Center',
    attendees: 234
  },
  {
    id: 2,
    title: 'Research Symposium',
    date: 'March 20, 2024',
    time: '9:00 AM - 6:00 PM',
    location: 'Science Building',
    attendees: 156
  },
  {
    id: 3,
    title: 'Startup Pitch Night',
    date: 'March 25, 2024',
    time: '7:00 PM - 10:00 PM',
    location: 'Innovation Hub',
    attendees: 89
  }
];

const achievements = [
  {
    id: 1,
    title: 'National Robotics Championship',
    description: 'Our robotics team secured 1st place',
    icon: Trophy,
    date: 'March 2024'
  },
  {
    id: 2,
    title: 'Research Grant Awarded',
    description: '$2M grant for AI research project',
    icon: BookOpen,
    date: 'February 2024'
  }
];

export default function University() {
  return (
    <Layout>
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

        {/* Departments */}
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

        {/* Upcoming Events */}
        <div className="post-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="p-4 bg-surface rounded-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {event.date} • {event.time}
                      </p>
                      <p>📍 {event.location}</p>
                      <p>👥 {event.attendees} attending</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="btn-ghost ml-4">
                    RSVP
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="post-card">
          <h2 className="text-xl font-bold text-foreground mb-4">Recent Achievements</h2>
          <div className="space-y-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div key={achievement.id} className="flex items-start gap-4 p-4 bg-surface rounded-xl">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{achievement.title}</h3>
                    <p className="text-muted-foreground mb-2">{achievement.description}</p>
                    <p className="text-sm text-muted-foreground">{achievement.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
