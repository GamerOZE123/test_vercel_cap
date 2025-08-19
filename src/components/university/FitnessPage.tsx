
import React, { useState } from 'react';
import { Calendar, Plus, Trophy, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AddQuickWorkoutModal from '@/components/fitness/AddQuickWorkoutModal';
import WorkoutLogModal from '@/components/fitness/WorkoutLogModal';
import AddToScheduleModal from '@/components/fitness/AddToScheduleModal';
import CreateChallengeModal from '@/components/fitness/CreateChallengeModal';
import ChallengeDetailModal from '@/components/fitness/ChallengeDetailModal';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useScheduledWorkouts } from '@/hooks/useScheduledWorkouts';
import { useFitnessChallenges } from '@/hooks/useFitnessChallenges';
import { useWorkoutSessions } from '@/hooks/useWorkoutSessions';

export default function FitnessPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isQuickWorkoutModalOpen, setIsQuickWorkoutModalOpen] = useState(false);
  const [isWorkoutLogModalOpen, setIsWorkoutLogModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);

  const { workouts, loading: workoutsLoading, refetch: refetchWorkouts } = useWorkouts();
  const { scheduledWorkouts, addScheduledWorkout, removeScheduledWorkout } = useScheduledWorkouts();
  const { challenges, loading: challengesLoading, refetch: refetchChallenges } = useFitnessChallenges();
  const { logWorkout } = useWorkoutSessions();

  const todaysWorkouts = scheduledWorkouts.filter(
    workout => workout.scheduled_date === selectedDate
  );

  const activeChallenges = challenges.filter(challenge => challenge.is_active);

  const handleQuickWorkout = () => {
    setIsQuickWorkoutModalOpen(true);
  };

  const handleLogWorkout = () => {
    setIsWorkoutLogModalOpen(true);
  };

  const handleScheduleWorkout = () => {
    setIsScheduleModalOpen(true);
  };

  const handleCreateChallenge = () => {
    setIsChallengeModalOpen(true);
  };

  const handleChallengeClick = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
  };

  const handleWorkoutCreated = () => {
    refetchWorkouts();
    setIsQuickWorkoutModalOpen(false);
  };

  const handleWorkoutLogged = () => {
    setIsWorkoutLogModalOpen(false);
  };

  const handleWorkoutScheduled = () => {
    setIsScheduleModalOpen(false);
  };

  const handleChallengeCreated = () => {
    refetchChallenges();
    setIsChallengeModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Fitness Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button onClick={handleQuickWorkout} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Quick Workout
          </Button>
          <Button onClick={handleLogWorkout} variant="outline" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Log Workout
          </Button>
          <Button onClick={handleScheduleWorkout} variant="outline" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Workout
          </Button>
          <Button onClick={handleCreateChallenge} variant="outline" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Create Challenge
          </Button>
        </div>
      </Card>

      {/* Gym Schedule */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Gym Schedule</h3>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-border rounded px-3 py-1 bg-background"
            />
          </div>
        </div>
        
        {todaysWorkouts.length > 0 ? (
          <div className="space-y-3">
            {todaysWorkouts.map((workout) => (
              <div key={workout.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h4 className="font-medium">
                    {workout.workouts?.title || 'Custom Workout'}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {workout.scheduled_time} • {workout.workouts?.duration || 30} minutes
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeScheduledWorkout(workout.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No workouts scheduled for {new Date(selectedDate).toLocaleDateString()}
          </p>
        )}
      </Card>

      {/* Active Challenges */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Active Challenges</h3>
        {challengesLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : activeChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeChallenges.map((challenge) => (
              <Card
                key={challenge.id}
                className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleChallengeClick(challenge.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium">{challenge.title}</h4>
                  <Badge variant="secondary">
                    <Users className="w-3 h-3 mr-1" />
                    {challenge.participant_count || 0}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {challenge.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Ends: {new Date(challenge.end_date).toLocaleDateString()}
                  </span>
                  <Badge variant="outline">
                    {challenge.target_value} {challenge.target_unit}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No active challenges. Create one to get started!
          </p>
        )}
      </Card>

      {/* My Workouts */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">My Workouts</h3>
        {workoutsLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : workouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workouts.map((workout) => (
              <Card key={workout.id} className="p-4">
                <h4 className="font-medium mb-2">{workout.title}</h4>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Duration: {workout.duration} minutes</p>
                  <p>Equipment: {workout.equipment}</p>
                  <p>Difficulty: {workout.difficulty}</p>
                  {workout.calories && <p>Calories: {workout.calories}</p>}
                </div>
                <Button 
                  size="sm" 
                  className="mt-3 w-full"
                  onClick={() => addScheduledWorkout(workout.id, selectedDate, '09:00')}
                >
                  Add to Schedule
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No workouts created yet. Create your first workout!
          </p>
        )}
      </Card>

      {/* Modals */}
      <AddQuickWorkoutModal
        isOpen={isQuickWorkoutModalOpen}
        onClose={() => setIsQuickWorkoutModalOpen(false)}
        onWorkoutCreated={handleWorkoutCreated}
      />

      <WorkoutLogModal
        isOpen={isWorkoutLogModalOpen}
        onClose={() => setIsWorkoutLogModalOpen(false)}
        onWorkoutLogged={handleWorkoutLogged}
      />

      <AddToScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onWorkoutScheduled={handleWorkoutScheduled}
        workouts={workouts}
      />

      <CreateChallengeModal
        isOpen={isChallengeModalOpen}
        onClose={() => setIsChallengeModalOpen(false)}
        onChallengeCreated={handleChallengeCreated}
      />

      {selectedChallengeId && (
        <ChallengeDetailModal
          challengeId={selectedChallengeId}
          isOpen={!!selectedChallengeId}
          onClose={() => setSelectedChallengeId(null)}
        />
      )}
    </div>
  );
}
