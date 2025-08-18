
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Dumbbell } from 'lucide-react';
import { toast } from 'sonner';

interface AddToScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableWorkouts: any[];
  onAdd: (selectedWorkouts: any[]) => void;
}

export default function AddToScheduleModal({ isOpen, onClose, availableWorkouts, onAdd }: AddToScheduleModalProps) {
  const [selectedWorkouts, setSelectedWorkouts] = useState<number[]>([]);
  const [scheduleTime, setScheduleTime] = useState('');

  const handleWorkoutToggle = (workoutId: number) => {
    setSelectedWorkouts(prev => 
      prev.includes(workoutId)
        ? prev.filter(id => id !== workoutId)
        : [...prev, workoutId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedWorkouts.length === 0) {
      toast.error('Please select at least one workout');
      return;
    }
    if (!scheduleTime) {
      toast.error('Please select a time');
      return;
    }

    const workoutsToAdd = availableWorkouts
      .filter(workout => selectedWorkouts.includes(workout.id))
      .map(workout => ({
        ...workout,
        time: scheduleTime,
        type: workout.difficulty
      }));

    onAdd(workoutsToAdd);
    toast.success('Workouts added to schedule!');
    setSelectedWorkouts([]);
    setScheduleTime('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Workouts to Schedule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="time">Schedule Time *</Label>
            <Input
              id="time"
              type="time"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              required
            />
          </div>

          <div>
            <Label>Select Workouts *</Label>
            <div className="space-y-3 mt-2">
              {availableWorkouts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No workouts available. Add some in the Quick Workouts section first.</p>
              ) : (
                availableWorkouts.map((workout) => (
                  <div key={workout.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`workout-${workout.id}`}
                      checked={selectedWorkouts.includes(workout.id)}
                      onCheckedChange={() => handleWorkoutToggle(workout.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Dumbbell className="w-4 h-4 text-primary" />
                        <span className="font-medium">{workout.title}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{workout.duration} min</span>
                        </div>
                        <span>{workout.difficulty}</span>
                        <span>{workout.equipment}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={selectedWorkouts.length === 0 || !scheduleTime}
            >
              Add to Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
