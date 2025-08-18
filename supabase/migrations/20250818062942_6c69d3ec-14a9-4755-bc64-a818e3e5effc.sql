
-- Create table for user workout sessions
CREATE TABLE public.workout_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  workout_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  calories_burned INTEGER,
  workout_type TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for fitness challenges
CREATE TABLE public.fitness_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL, -- 'distance', 'reps', 'time', 'calories'
  target_value INTEGER NOT NULL,
  target_unit TEXT NOT NULL, -- 'miles', 'reps', 'minutes', 'calories'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER,
  prize_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for challenge participants
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.fitness_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  current_progress INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create table for challenge progress updates
CREATE TABLE public.challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES public.fitness_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  progress_value INTEGER NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_sessions
CREATE POLICY "Users can view their own workout sessions" 
  ON public.workout_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout sessions" 
  ON public.workout_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout sessions" 
  ON public.workout_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout sessions" 
  ON public.workout_sessions 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for fitness_challenges
CREATE POLICY "Challenges are viewable by everyone" 
  ON public.fitness_challenges 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create challenges" 
  ON public.fitness_challenges 
  FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Challenge creators can update their challenges" 
  ON public.fitness_challenges 
  FOR UPDATE 
  USING (auth.uid() = creator_id);

-- RLS Policies for challenge_participants
CREATE POLICY "Challenge participants are viewable by everyone" 
  ON public.challenge_participants 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can join challenges" 
  ON public.challenge_participants 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation" 
  ON public.challenge_participants 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for challenge_progress
CREATE POLICY "Challenge progress is viewable by everyone" 
  ON public.challenge_progress 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can record their own progress" 
  ON public.challenge_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
  ON public.challenge_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to update challenge participant progress
CREATE OR REPLACE FUNCTION update_challenge_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.challenge_participants 
  SET current_progress = (
    SELECT COALESCE(SUM(progress_value), 0)
    FROM public.challenge_progress 
    WHERE challenge_id = NEW.challenge_id AND user_id = NEW.user_id
  )
  WHERE challenge_id = NEW.challenge_id AND user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update progress
CREATE TRIGGER update_participant_progress
  AFTER INSERT OR UPDATE ON public.challenge_progress
  FOR EACH ROW EXECUTE FUNCTION update_challenge_progress();
