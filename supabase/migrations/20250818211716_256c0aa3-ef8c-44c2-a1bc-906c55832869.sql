
-- Create workouts table for custom user workouts
CREATE TABLE public.workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  duration integer NOT NULL, -- duration in minutes
  difficulty text NOT NULL,
  equipment text NOT NULL,
  calories text,
  workout_type text DEFAULT 'Custom',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for workouts
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for workouts
CREATE POLICY "Users can view their own workouts" 
  ON public.workouts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts" 
  ON public.workouts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" 
  ON public.workouts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" 
  ON public.workouts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create scheduled workouts table
CREATE TABLE public.scheduled_workouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  workout_id uuid REFERENCES public.workouts(id) ON DELETE CASCADE,
  scheduled_time text NOT NULL, -- time like "09:00 AM"
  scheduled_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for scheduled workouts
ALTER TABLE public.scheduled_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for scheduled workouts
CREATE POLICY "Users can view their own scheduled workouts" 
  ON public.scheduled_workouts 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scheduled workouts" 
  ON public.scheduled_workouts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled workouts" 
  ON public.scheduled_workouts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update challenge_participants to track actual participant count
-- Add function to count challenge participants
CREATE OR REPLACE FUNCTION get_challenge_participant_count(challenge_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::integer
  FROM public.challenge_participants
  WHERE challenge_id = challenge_uuid;
$$;
