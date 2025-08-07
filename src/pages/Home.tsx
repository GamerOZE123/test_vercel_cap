
import React from 'react';
import Layout from '@/components/layout/Layout';
import CreatePost from '@/components/post/CreatePost';
import PostCard from '@/components/post/PostCard';

const mockPosts = [
  {
    id: 1,
    user: {
      name: 'Sarah Johnson',
      avatar: 'SJ',
      university: 'Computer Science • MIT'
    },
    content: 'Just finished my machine learning project! The results were better than expected. Can\'t wait to present it next week 🚀',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop&crop=center',
    likes: 24,
    comments: 8,
    timestamp: '2h'
  },
  {
    id: 2,
    user: {
      name: 'Mike Chen',
      avatar: 'MC',
      university: 'Engineering • Stanford'
    },
    content: 'Study group meeting tomorrow at 3 PM in the library. We\'ll be covering chapters 5-7. Bring your notes!',
    likes: 12,
    comments: 5,
    timestamp: '4h'
  },
  {
    id: 3,
    user: {
      name: 'Emily Davis',
      avatar: 'ED',
      university: 'Business • Harvard'
    },
    content: 'Amazing guest lecture today about sustainable business practices. Really opened my eyes to new possibilities in the corporate world.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop&crop=center',
    likes: 31,
    comments: 12,
    timestamp: '6h'
  }
];

export default function Home() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <CreatePost />
        <div className="space-y-6">
          {mockPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
