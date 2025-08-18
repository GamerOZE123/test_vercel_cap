
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useWorkouts } from '@/hooks/useWorkouts';
import { toast } from 'sonner';

interface WorkoutLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const workoutTypes = [
  'Cardio',
  'Strength Training',
  'HIIT',
  'Yoga',
  'Pilates',
  'Running',
  'Cycling',
  'Swimming',
  'Other'
];

export default function WorkoutLogModal({ isOpen, onClose }: WorkoutLogModalProps) {
  const [formData, setFormData] = useState({
    workout_name: '',
    duration_minutes: '',
    calories_burned: '',
    workout_type: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addWorkout } = useWorkouts();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.workout_name || !formData.duration_minutes) {
      toast.error('Please fill in the required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addWorkout({
        workout_name: formData.workout_name,
        duration_minutes: parseInt(formData.duration_minutes),
        calories_burned: formData.calories_burned ? parseInt(formData.calories_burned) : undefined,
        workout_type: formData.workout_type || undefined,
        notes: formData.notes || undefined
      });
      
      toast.success('Workout logged successfully!');
      setFormData({
        workout_name: '',
        duration_minutes: '',
        calories_burned: '',
        workout_type: '',
        notes: ''
      });
      onClose();
    } catch (error) {
      toast.error('Failed to log workout');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Log Workout</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="workout_name">Workout Name *</Label>
            <Input
              id="workout_name"
              value={formData.workout_name}
              onChange={(e) => handleChange('workout_name', e.target.value)}
              placeholder="e.g., Morning Run"
              required
            />
          </div>

          <div>
            <Label htmlFor="workout_type">Workout Type</Label>
            <Select value={formData.workout_type} onValueChange={(value) => handleChange('workout_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select workout type" />
              </SelectTrigger>
              <SelectContent>
                {workoutTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
            <Input
              id="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => handleChange('duration_minutes', e.target.value)}
              placeholder="30"
              min="1"
              required
            />
          </div>

          <div>
            <Label htmlFor="calories_burned">Calories Burned</Label>
            <Input
              id="calories_burned"
              type="number"
              value={formData.calories_burned}
              onChange={(e) => handleChange('calories_burned', e.target.value)}
              placeholder="250"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="How did the workout feel?"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Logging...' : 'Log Workout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
