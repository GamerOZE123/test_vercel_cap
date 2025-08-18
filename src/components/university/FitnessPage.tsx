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
  Play,
  Eye,
  Trash2
} from 'lucide-react';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useFitnessChallenges } from '@/hooks/useFitnessChallenges';
import WorkoutLogModal from '@/components/fitness/WorkoutLogModal';
import CreateChallengeModal from '@/components/fitness/CreateChallengeModal';
import WorkoutTimer from '@/components/fitness/WorkoutTimer';
import FitnessNavigation from '@/components/fitness/FitnessNavigation';
import ChallengeDetailModal from '@/components/fitness/ChallengeDetailModal';
import AddQuickWorkoutModal from '@/components/fitness/AddQuickWorkoutModal';
import AddToScheduleModal from '@/components/fitness/AddToScheduleModal';
import { toast } from 'sonner';

type TabType = 'overview' | 'challenges' | 'buddies' | 'workouts' | 'schedule';

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

export default function FitnessPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isChallengeDetailOpen, setIsChallengeDetailOpen] = useState(false);
  const [isAddWorkoutModalOpen, setIsAddWorkoutModalOpen] = useState(false);
  const [isAddToScheduleModalOpen, setIsAddToScheduleModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<string>('');
  const [selectedWorkoutDuration, setSelectedWorkoutDuration] = useState<number>(15);
  const [customWorkouts, setCustomWorkouts] = useState<any[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<any[]>([]);
  
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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
      toast.success('Successfully joined the challenge!');
      setIsChallengeDetailOpen(false);
    } catch (error) {
      toast.error('Failed to join challenge');
    }
  };

  const handleStartWorkout = (workoutTitle: string, duration?: number) => {
    setSelectedWorkout(workoutTitle);
    setSelectedWorkoutDuration(duration || 15);
    setIsTimerOpen(true);
  };

  const handleViewChallenge = (challenge: any) => {
    setSelectedChallenge(challenge);
    setIsChallengeDetailOpen(true);
  };

  const handleAddCustomWorkout = (workout: any) => {
    setCustomWorkouts(prev => [...prev, workout]);
  };

  const handleDeleteWorkout = (workoutId: number) => {
    setCustomWorkouts(prev => prev.filter(w => w.id !== workoutId));
    toast.success('Workout deleted successfully!');
  };

  const handleAddToSchedule = (workoutsToAdd: any[]) => {
    setScheduledWorkouts(prev => [...prev, ...workoutsToAdd]);
  };

  const handleRemoveFromSchedule = (index: number) => {
    setScheduledWorkouts(prev => prev.filter((_, i) => i !== index));
    toast.success('Workout removed from schedule!');
  };

  const joinedChallenges = challenges.filter(challenge => 
    userChallenges.some(uc => uc.challenge_id === challenge.id)
  );

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

            {/* Quick Action */}
            <div className="flex gap-4">
              <Button onClick={() => setIsWorkoutModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Log Workout
              </Button>
            </div>

            {/* Joined Challenges */}
            {joinedChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>My Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {joinedChallenges.map((challenge) => {
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
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Joined
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

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
                  const participantCount = Math.floor(Math.random() * 50) + 1; // Mock participant count
                  
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
                            <span>Participants</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {participantCount} joined
                            </span>
                          </div>
                        </div>

                        {challenge.prize_description && (
                          <div className="p-3 bg-surface rounded-lg">
                            <p className="text-sm font-medium text-foreground">{challenge.prize_description}</p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 flex items-center gap-1"
                            onClick={() => handleViewChallenge(challenge)}
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1" 
                            disabled={isJoined || daysLeft <= 0}
                            onClick={() => handleJoinChallenge(challenge.id)}
                          >
                            {isJoined ? 'Joined' : daysLeft <= 0 ? 'Ended' : 'Join'}
                          </Button>
                        </div>
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
              <Button onClick={() => setIsAddWorkoutModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Workout
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customWorkouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">{workout.title}</h3>
                        <div className="flex gap-2">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <Dumbbell className="w-5 h-5 text-white" />
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWorkout(workout.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{workout.duration} min</span>
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
                        onClick={() => handleStartWorkout(workout.title, workout.duration)}
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
              <h2 className="text-2xl font-bold">Today's Workouts</h2>
              <Button onClick={() => setIsAddToScheduleModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add to Schedule
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Your Workout Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledWorkouts.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No workouts scheduled yet. Add some from your Quick Workouts!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {scheduledWorkouts.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface/80 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="font-semibold text-foreground">{session.time}</p>
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{session.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Timer className="w-4 h-4" />
                              <span>{session.duration} min</span>
                              <span>•</span>
                              <span>{session.type}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStartWorkout(session.title, session.duration)}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Start
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFromSchedule(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
      <FitnessNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-6 mt-16 md:mt-0">
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
      <ChallengeDetailModal
        isOpen={isChallengeDetailOpen}
        onClose={() => setIsChallengeDetailOpen(false)}
        challenge={selectedChallenge}
        isJoined={selectedChallenge ? userChallenges.some(uc => uc.challenge_id === selectedChallenge.id) : false}
        onJoin={handleJoinChallenge}
      />
      <AddQuickWorkoutModal
        isOpen={isAddWorkoutModalOpen}
        onClose={() => setIsAddWorkoutModalOpen(false)}
        onAdd={handleAddCustomWorkout}
      />
      <AddToScheduleModal
        isOpen={isAddToScheduleModalOpen}
        onClose={() => setIsAddToScheduleModalOpen(false)}
        availableWorkouts={customWorkouts}
        onAdd={handleAddToSchedule}
      />
      <WorkoutTimer
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        workoutName={selectedWorkout}
        duration={selectedWorkoutDuration}
      />
    </div>
  );
}
