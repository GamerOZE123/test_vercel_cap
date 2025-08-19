import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Target, Trophy, Users, Plus, Play, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import WorkoutTimer from '@/components/fitness/WorkoutTimer';
import CreateChallengeModal from '@/components/fitness/CreateChallengeModal';
import ChallengeDetailModal from '@/components/fitness/ChallengeDetailModal';
import AddQuickWorkoutModal from '@/components/fitness/AddQuickWorkoutModal';
import WorkoutLogModal from '@/components/fitness/WorkoutLogModal';
import AddToScheduleModal from '@/components/fitness/AddToScheduleModal';
import MonthlyScheduleModal from '@/components/fitness/MonthlyScheduleModal';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useScheduledWorkouts } from '@/hooks/useScheduledWorkouts';
import { useFitnessChallenges } from '@/hooks/useFitnessChallenges';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';

type TabType = 'overview' | 'challenges' | 'buddies' | 'workouts' | 'schedule';

export default function FitnessPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<any>(null);
  const [isChallengeDetailOpen, setIsChallengeDetailOpen] = useState(false);
  const [isQuickWorkoutOpen, setIsQuickWorkoutOpen] = useState(false);
  const [isWorkoutLogOpen, setIsWorkoutLogOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isMonthlyScheduleOpen, setIsMonthlyScheduleOpen] = useState(false);

  const { workouts, loading: workoutsLoading, addWorkout } = useWorkouts();
  const { scheduledWorkouts, loading: scheduleLoading, markWorkoutCompleted } = useScheduledWorkouts();
  const { challenges, loading: challengesLoading, userChallenges, joinChallenge } = useFitnessChallenges();
  const { sessions, addSession } = useWorkoutSessions();

  const todaySchedule = scheduledWorkouts.filter(
    workout => workout.scheduled_date === new Date().toISOString().split('T')[0]
  );

  const workoutOfTheDay = workouts.length > 0 ? workouts[Math.floor(Math.random() * workouts.length)] : null;

  const isJoined = (challengeId: string) => {
    return userChallenges.some(uc => uc.challenge_id === challengeId);
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      await joinChallenge(challengeId);
    } catch (error) {
      console.error('Error joining challenge:', error);
    }
  };

  const handleScheduleWorkouts = async (workoutIds: string[], time: string, date?: string) => {
    try {
      for (const workoutId of workoutIds) {
        await addScheduledWorkout(workoutId, time, date);
      }
    } catch (error) {
      console.error('Error scheduling workouts:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="buddies">Buddies</TabsTrigger>
            <TabsTrigger value="workouts">Workouts</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Workout of the Day */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Workout of the Day
                  </CardTitle>
                  <CardDescription>Recommended workout for today</CardDescription>
                </CardHeader>
                <CardContent>
                  {workoutOfTheDay ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold">{workoutOfTheDay.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {workoutOfTheDay.duration} min
                          </span>
                          <Badge variant="secondary">{workoutOfTheDay.difficulty}</Badge>
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedWorkout(workoutOfTheDay);
                          setIsTimerOpen(true);
                        }}
                        className="w-full"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Workout
                      </Button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No workouts available</p>
                  )}
                </CardContent>
              </Card>

              {/* Today's Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>Your scheduled workouts for today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todaySchedule.length > 0 ? (
                      todaySchedule.map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markWorkoutCompleted(workout.id)}
                              className="p-0 h-6 w-6"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <div>
                              <p className="font-medium">{workout.workouts?.title || 'Custom Workout'}</p>
                              <p className="text-sm text-muted-foreground">{workout.scheduled_time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No workouts scheduled for today</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Workouts</p>
                      <p className="text-2xl font-bold">{workouts.length}</p>
                    </div>
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Challenges</p>
                      <p className="text-2xl font-bold">{challenges.filter(c => c.is_active).length}</p>
                    </div>
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Sessions This Month</p>
                      <p className="text-2xl font-bold">{sessions.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="challenges" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Fitness Challenges</h2>
                <p className="text-muted-foreground">Join challenges and compete with others</p>
              </div>
              <Button onClick={() => setIsCreateChallengeOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Challenge
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="cursor-pointer hover:shadow-lg transition-shadow" 
                      onClick={() => {
                        setSelectedChallenge(challenge);
                        setIsChallengeDetailOpen(true);
                      }}>
                  <CardHeader>
                    <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    <CardDescription>{challenge.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>0/{challenge.target_value} {challenge.target_unit}</span>
                      </div>
                      <Progress value={0} className="h-2" />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{new Date(challenge.start_date).toLocaleDateString()}</span>
                        <Badge variant={challenge.is_active ? "default" : "secondary"}>
                          {challenge.is_active ? "Active" : "Ended"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="buddies" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Workout Buddies</h2>
              <p className="text-muted-foreground">Connect with other fitness enthusiasts</p>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Find Workout Partners</h3>
                <p className="text-muted-foreground mb-4">Connect with people who share your fitness goals</p>
                <Button>Find Buddies</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Workouts</h2>
                <p className="text-muted-foreground">Manage your workout routines</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsQuickWorkoutOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Add
                </Button>
                <Button onClick={() => setIsWorkoutLogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log Workout
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workouts.map((workout) => (
                <Card key={workout.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{workout.title}</CardTitle>
                    <CardDescription>
                      {workout.duration} min • {workout.equipment}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{workout.difficulty}</Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" 
                                onClick={() => setIsScheduleModalOpen(true)}>
                          Schedule
                        </Button>
                        <Button size="sm" 
                                onClick={() => {
                                  setSelectedWorkout(workout);
                                  setIsTimerOpen(true);
                                }}>
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Gym Schedule</h2>
                <p className="text-muted-foreground">Plan your workout schedule</p>
              </div>
              <Button onClick={() => setIsMonthlyScheduleOpen(true)}>
                <Calendar className="h-4 w-4 mr-2" />
                View Full Schedule
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <Card key={day}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">No workouts scheduled</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <WorkoutTimer
          isOpen={isTimerOpen}
          onClose={() => setIsTimerOpen(false)}
          workoutName={selectedWorkout?.title}
          duration={selectedWorkout?.duration}
        />

        <CreateChallengeModal
          isOpen={isCreateChallengeOpen}
          onClose={() => setIsCreateChallengeOpen(false)}
        />

        <ChallengeDetailModal
          isOpen={isChallengeDetailOpen}
          onClose={() => setIsChallengeDetailOpen(false)}
          challenge={selectedChallenge}
          isJoined={selectedChallenge ? isJoined(selectedChallenge.id) : false}
          onJoin={handleJoinChallenge}
        />

        <AddQuickWorkoutModal
          isOpen={isQuickWorkoutOpen}
          onClose={() => setIsQuickWorkoutOpen(false)}
          onAdd={addWorkout}
        />

        <WorkoutLogModal
          isOpen={isWorkoutLogOpen}
          onClose={() => setIsWorkoutLogOpen(false)}
        />

        <AddToScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          availableWorkouts={workouts}
          onAdd={handleScheduleWorkouts}
        />

        <MonthlyScheduleModal
          isOpen={isMonthlyScheduleOpen}
          onClose={() => setIsMonthlyScheduleOpen(false)}
          availableWorkouts={workouts}
          onSchedule={handleScheduleWorkouts}
        />
      </div>
    </div>
  );
}
