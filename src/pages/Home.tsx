
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
      university: 'Computer Science, MIT'
    },
    content: 'Just finished my machine learning project! The model achieved 94% accuracy on the test dataset. Really excited about the potential applications in healthcare. 🤖',
    image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=500&h=300&fit=crop',
    likes: 24,
    comments: 8,
    timestamp: '2h'
  },
  {
    id: 2,
    user: {
      name: 'Mike Chen',
      avatar: 'MC',
      university: 'Engineering, Stanford'
    },
    content: 'Our robotics team won first place at the national competition! Months of hard work finally paid off. Special thanks to my teammates who made this possible 🏆',
    likes: 56,
    comments: 15,
    timestamp: '4h'
  },
  {
    id: 3,
    user: {
      name: 'Emily Davis',
      avatar: 'ED',
      university: 'Business, Harvard'
    },
    content: 'Interesting discussion in today\'s entrepreneurship class about the future of sustainable business models. The intersection of profit and environmental responsibility is fascinating.',
    likes: 18,
    comments: 6,
    timestamp: '6h'
  },
  {
    id: 4,
    user: {
      name: 'Alex Rivera',
      avatar: 'AR',
      university: 'Design, RISD'
    },
    content: 'Working on a new UI design for our mobile app. The dark theme is coming together nicely! What do you think about minimalist interfaces in educational apps?',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
    likes: 31,
    comments: 12,
    timestamp: '8h'
  }
];

export default function Home() {
  return (
    <Layout>
      <div className="space-y-6">
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
