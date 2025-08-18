
import React, { useState, useMemo } from 'react';
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
  User,
  Play
} from 'lucide-react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useFitnessChallenges } from '@/hooks/useFitnessChallenges';
import WorkoutLogModal from '@/components/fitness/WorkoutLogModal';
import CreateChallengeModal from '@/components/fitness/CreateChallengeModal';
import WorkoutTimer from '@/components/fitness/WorkoutTimer';
import FitnessNavigation from '@/components/fitness/FitnessNavigation';
import { toast } from 'sonner';

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
    id: 1,
    title: '15-Min HIIT Blast',
    duration: '15 min',
    difficulty: 'Intermediate',
    equipment: 'None',
    calories: '150-200'
  },
  {
    id: 2,
    title: 'Dorm Room Strength',
    duration: '20 min',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    calories: '100-150'
  },
  {
    id: 3,
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
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');
  
  const { workouts, loading: workoutsLoading } = useWorkouts();
  const { challenges, userChallenges, loading: challengesLoading, joinChallenge } = useFitnessChallenges();

  // Calculate dynamic fitness stats
  const fitnessStats = useMemo(() => {
    const thisWeekWorkouts = workouts.filter(workout => {
      const workoutDate = new Date(workout.created_at);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return workoutDate >= oneWeekAgo;
    });

    const totalCalories = workouts.reduce((sum, workout) => sum + (workout.calories_burned || 0), 0);
    const totalMinutes = workouts.reduce((sum, workout) => sum + workout.duration_minutes, 0);
    
    // Calculate streak
    let streak = 0;
    const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const workout of sortedWorkouts) {
      const workoutDate = new Date(workout.created_at);
      workoutDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return [
      { label: 'Weekly Workouts', value: thisWeekWorkouts.length.toString(), icon: Dumbbell, color: 'text-blue-500' },
      { label: 'Calories Burned', value: totalCalories.toLocaleString(), icon: Zap, color: 'text-orange-500' },
      { label: 'Active Minutes', value: totalMinutes.toString(), icon: Timer, color: 'text-green-500' },
      { label: 'Workout Streak', value: `${streak} days`, icon: TrendingUp, color: 'text-purple-500' }
    ];
  }, [workouts]);

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
      toast.success('Successfully joined the challenge!');
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  const handleStartWorkout = (workoutTitle: string) => {
    setSelectedWorkout(workoutTitle);
    setIsTimerOpen(true);
  };

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

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Button onClick={() => setIsWorkoutModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Log Workout
              </Button>
              <Button variant="outline" onClick={() => setIsChallengeModalOpen(true)} className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Create Challenge
              </Button>
            </div>

            {/* Recent Workouts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                {workoutsLoading ? (
                  <p className="text-center text-muted-foreground">Loading workouts...</p>
                ) : workouts.length === 0 ? (
                  <p className="text-center text-muted-foreground">No workouts logged yet. Start by logging your first workout!</p>
                ) : (
                  <div className="space-y-3">
                    {workouts.slice(0, 5).map((workout) => (
                      <div key={workout.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{workout.workout_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {workout.duration_minutes} minutes
                              {workout.calories_burned && ` • ${workout.calories_burned} calories`}
                              {workout.workout_type && ` • ${workout.workout_type}`}
                            </p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(workout.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Challenges Preview */}
            {challenges.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Active Challenges</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('challenges')}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {challenges.slice(0, 3).map((challenge) => {
                      const isJoined = userChallenges.some(uc => uc.challenge_id === challenge.id);
                      const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={challenge.id} className="flex items-center justify-between p-3 bg-surface rounded-lg">
                          <div className="flex items-center gap-3">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            <div>
                              <p className="font-medium">{challenge.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'} • {challenge.target_value} {challenge.target_unit}
                              </p>
                            </div>
                          </div>
                          {isJoined && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Joined
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 'challenges':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Fitness Challenges</h2>
              <Button onClick={() => setIsChallengeModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create Challenge
              </Button>
            </div>

            {challengesLoading ? (
              <p className="text-center text-muted-foreground">Loading challenges...</p>
            ) : challenges.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No active challenges yet. Be the first to create one!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => {
                  const isJoined = userChallenges.some(uc => uc.challenge_id === challenge.id);
                  const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <Trophy className="w-8 h-8 text-yellow-500" />
                          <span className="text-sm text-muted-foreground">
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {challenge.description && (
                          <p className="text-sm text-muted-foreground">{challenge.description}</p>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Target</span>
                            <span>{challenge.target_value} {challenge.target_unit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Type</span>
                            <span className="capitalize">{challenge.challenge_type}</span>
                          </div>
                        </div>

                        {challenge.prize_description && (
                          <div className="p-3 bg-surface rounded-lg">
                            <p className="text-sm font-medium text-foreground">{challenge.prize_description}</p>
                          </div>
                        )}

                        <Button 
                          className="w-full" 
                          disabled={isJoined || daysLeft <= 0}
                          onClick={() => handleJoinChallenge(challenge.id)}
                        >
                          {isJoined ? 'Already Joined' : daysLeft <= 0 ? 'Challenge Ended' : 'Join Challenge'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
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
              <Button onClick={() => setIsWorkoutModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Workout
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickWorkouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-lg transition-shadow">
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

                      <Button 
                        className="w-full flex items-center gap-2"
                        onClick={() => handleStartWorkout(workout.title)}
                      >
                        <Play className="w-4 h-4" />
                        Start Workout
                      </Button>
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
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      {/* Custom Navigation */}
      <FitnessNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Header */}
      <div className="post-card mt-16 md:mt-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fitness & Wellness</h1>
            <p className="text-muted-foreground">Stay healthy, stay motivated, stay connected!</p>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6">
        {renderTabContent()}
      </div>

      {/* Modals */}
      <WorkoutLogModal 
        isOpen={isWorkoutModalOpen}
        onClose={() => setIsWorkoutModalOpen(false)}
      />
      <CreateChallengeModal 
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
      />
      <WorkoutTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        workoutName={selectedWorkout}
      />
    </div>
  );
}
