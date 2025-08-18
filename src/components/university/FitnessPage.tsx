
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dumbbell, 
  Trophy, 
  Users, 
  Target, 
  Calendar,
  Timer,
  Heart,
  TrendingUp,
  Plus,
  MapPin,
  Clock,
  Zap,
  Award,
  User
} from 'lucide-react';

const fitnessStats = [
  { label: 'Weekly Workouts', value: '5', icon: Dumbbell, color: 'text-blue-500' },
  { label: 'Calories Burned', value: '2,340', icon: Zap, color: 'text-orange-500' },
  { label: 'Active Minutes', value: '420', icon: Timer, color: 'text-green-500' },
  { label: 'Workout Streak', value: '12 days', icon: TrendingUp, color: 'text-purple-500' }
];

const activeChallenges = [
  {
    id: 1,
    title: '30-Day Push-Up Challenge',
    description: 'Complete 1,000 push-ups in 30 days',
    progress: 65,
    participants: 234,
    daysLeft: 12,
    prize: '🏆 Winner gets gym gear package'
  },
  {
    id: 2,
    title: 'Campus Marathon Prep',
    description: 'Train for the university marathon together',
    progress: 40,
    participants: 89,
    daysLeft: 45,
    prize: '🎽 Free marathon registration'
  },
  {
    id: 3,
    title: 'Healthy Habits Week',
    description: '7 days of balanced nutrition and exercise',
    progress: 85,
    participants: 156,
    daysLeft: 2,
    prize: '🥗 Healthy meal vouchers'
  }
];

const workoutBuddies = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: 'SC',
    workoutType: 'Cardio & Strength',
    schedule: 'Mon, Wed, Fri 6PM',
    location: 'Campus Gym',
    rating: 4.8
  },
  {
    id: 2,
    name: 'Mike Rodriguez',
    avatar: 'MR',
    workoutType: 'Weight Training',
    schedule: 'Tue, Thu, Sat 7AM',
    location: 'Fitness Center',
    rating: 4.9
  },
  {
    id: 3,
    name: 'Emma Wilson',
    avatar: 'EW',
    workoutType: 'Yoga & Pilates',
    schedule: 'Daily 5PM',
    location: 'Recreation Hall',
    rating: 4.7
  }
];

const quickWorkouts = [
  {
    title: '15-Min HIIT Blast',
    duration: '15 min',
    difficulty: 'Intermediate',
    equipment: 'None',
    calories: '150-200'
  },
  {
    title: 'Dorm Room Strength',
    duration: '20 min',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    calories: '100-150'
  },
  {
    title: 'Study Break Stretch',
    duration: '10 min',
    difficulty: 'Easy',
    equipment: 'None',
    calories: '30-50'
  }
];

const gymSchedule = [
  { time: '6:00 AM', activity: 'Morning Cardio', instructor: 'Coach Johnson', spots: 12 },
  { time: '12:00 PM', activity: 'Lunch Break Yoga', instructor: 'Lisa Park', spots: 8 },
  { time: '5:00 PM', activity: 'Strength Training', instructor: 'Mike Torres', spots: 15 },
  { time: '7:00 PM', activity: 'Zumba Dance', instructor: 'Maria Santos', spots: 5 }
];

export default function FitnessPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'challenges' | 'buddies' | 'workouts' | 'schedule'>('overview');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {fitnessStats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`w-8 h-8 mx-auto mb-2 ${stat.color}`} />
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progress Chart Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-surface rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Progress chart would go here</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Dumbbell className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Upper Body Strength</p>
                        <p className="text-sm text-muted-foreground">45 minutes • 280 calories</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Morning Run</p>
                        <p className="text-sm text-muted-foreground">30 minutes • 320 calories</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">Yesterday</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'challenges':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Fitness Challenges</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Challenge
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeChallenges.map((challenge) => (
                <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Trophy className="w-8 h-8 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">{challenge.daysLeft} days left</span>
                    </div>
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${challenge.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {challenge.participants} participants
                      </div>
                    </div>

                    <div className="p-3 bg-surface rounded-lg">
                      <p className="text-sm font-medium text-foreground">{challenge.prize}</p>
                    </div>

                    <Button className="w-full">Join Challenge</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'buddies':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Workout Buddies</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Find Buddy
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workoutBuddies.map((buddy) => (
                <Card key={buddy.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{buddy.avatar}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{buddy.name}</h3>
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-muted-foreground">{buddy.rating}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{buddy.workoutType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{buddy.schedule}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{buddy.location}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="flex-1">Message</Button>
                      <Button size="sm" className="flex-1">Partner Up</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'workouts':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Quick Workouts</h2>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Workout
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickWorkouts.map((workout, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{workout.title}</h3>
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{workout.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span>{workout.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Dumbbell className="w-4 h-4 text-muted-foreground" />
                          <span>{workout.equipment}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-muted-foreground" />
                          <span>{workout.calories}</span>
                        </div>
                      </div>

                      <Button className="w-full">Start Workout</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Gym Schedule</h2>
              <Button className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Book Session
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Today's Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gymSchedule.map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="font-semibold text-foreground">{session.time}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{session.activity}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>{session.instructor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">{session.spots} spots left</p>
                        <Button size="sm" variant="outline">Book</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="post-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fitness & Wellness</h1>
            <p className="text-muted-foreground">Stay healthy, stay motivated, stay connected!</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'overview', label: 'Overview', icon: TrendingUp },
            { key: 'challenges', label: 'Challenges', icon: Trophy },
            { key: 'buddies', label: 'Workout Buddies', icon: Users },
            { key: 'workouts', label: 'Quick Workouts', icon: Dumbbell },
            { key: 'schedule', label: 'Gym Schedule', icon: Calendar }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.key as any)}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
