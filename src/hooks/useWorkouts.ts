
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface WorkoutSession {
  id: string;
  workout_name: string;
  duration_minutes: number;
  calories_burned?: number;
  workout_type?: string;
  notes?: string;
  created_at: string;
}

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchWorkouts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addWorkout = async (workoutData: Omit<WorkoutSession, 'id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .insert([{
          ...workoutData,
          user_id: user.id
        }])
        .select()
        .single();
        
      if (error) throw error;
      setWorkouts(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding workout:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  return {
    workouts,
    loading,
    addWorkout,
    fetchWorkouts
  };
};
