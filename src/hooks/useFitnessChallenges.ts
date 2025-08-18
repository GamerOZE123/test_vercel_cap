
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface FitnessChallenge {
  id: string;
  title: string;
  description?: string;
  challenge_type: string;
  target_value: number;
  target_unit: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  max_participants?: number;
  prize_description?: string;
  creator_id: string;
  created_at: string;
}

interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  current_progress: number;
  joined_at: string;
}

export const useFitnessChallenges = () => {
  const [challenges, setChallenges] = useState<FitnessChallenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('fitness_challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserChallenges = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setUserChallenges(data || []);
    } catch (error) {
      console.error('Error fetching user challenges:', error);
    }
  };

  const createChallenge = async (challengeData: Omit<FitnessChallenge, 'id' | 'creator_id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('fitness_challenges')
        .insert([{
          ...challengeData,
          creator_id: user.id
        }])
        .select()
        .single();
        
      if (error) throw error;
      setChallenges(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert([{
          challenge_id: challengeId,
          user_id: user.id
        }])
        .select()
        .single();
        
      if (error) throw error;
      setUserChallenges(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  };

  const recordProgress = async (challengeId: string, progressValue: number, notes?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error } = await supabase
        .from('challenge_progress')
        .insert([{
          challenge_id: challengeId,
          user_id: user.id,
          progress_value: progressValue,
          notes
        }])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording progress:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchChallenges();
    fetchUserChallenges();
  }, [user]);

  return {
    challenges,
    userChallenges,
    loading,
    createChallenge,
    joinChallenge,
    recordProgress,
    fetchChallenges
  };
};
