
import React from 'react';
import Layout from '@/components/layout/Layout';
import PostCard from '@/components/post/PostCard';
import { Button } from '@/components/ui/button';
import { Settings, MapPin, Calendar, Link as LinkIcon } from 'lucide-react';

const userPosts = [
  {
    id: 1,
    user: {
      name: 'John Doe',
      avatar: 'JD',
      university: 'Computer Science, MIT'
    },
    content: 'Excited to share my latest research on quantum computing algorithms. The potential for solving complex optimization problems is incredible! 🚀',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500&h=300&fit=crop',
    likes: 42,
    comments: 12,
    timestamp: '1d'
  },
  {
    id: 2,
    user: {
      name: 'John Doe',
      avatar: 'JD',
      university: 'Computer Science, MIT'
    },
    content: 'Had an amazing time at the hackathon last weekend! Our team built an AI-powered study assistant. Thanks to everyone who participated! 💻',
    likes: 38,
    comments: 9,
    timestamp: '3d'
  }
];

export default function Profile() {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="post-card">
          <div className="relative">
            {/* Cover Image */}
            <div className="h-32 university-gradient rounded-xl mb-4"></div>
            
            {/* Profile Info */}
            <div className="flex items-start gap-4">
              <div className="relative -mt-8">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-4 border-card">
                  <span className="text-2xl font-bold text-white">JD</span>
                </div>
              </div>
              
              <div className="flex-1 pt-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">John Doe</h1>
                    <p className="text-muted-foreground">Computer Science Student</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>MIT, Cambridge</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined March 2023</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="btn-ghost">
                      Edit Profile
                    </Button>
                    <Button variant="ghost" size="icon" className="btn-ghost">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-foreground leading-relaxed">
                    Passionate about quantum computing and AI. Currently working on my thesis about quantum machine learning algorithms. 
                    Always interested in collaborating on innovative projects! 🎓
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-primary">
                    <LinkIcon className="w-4 h-4" />
                    <a href="#" className="hover:underline">github.com/johndoe</a>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">156</p>
                    <p className="text-sm text-muted-foreground">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">2.1k</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-foreground">892</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-foreground">Recent Posts</h2>
          {userPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
